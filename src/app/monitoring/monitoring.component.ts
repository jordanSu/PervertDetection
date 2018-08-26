import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import * as io from "socket.io-client";

@Component({
  selector: "monitoring-cmp",
  moduleId: module.id,
  templateUrl: "monitoring.component.html",
  styleUrls: ["./monitoring.component.css"]
})
export class MonitoringComponent implements OnInit {
  @ViewChild("VideoContent")
  videoContent: ElementRef;

  @ViewChild("VideoContainer")
  videoContainer: ElementRef;

  @ViewChild("test")
  donut: ElementRef;

  isSuccessAccessVideo = true;

  errorMessage: string = null;

  socket: SocketIOClient.Socket;

  peerConnection: RTCPeerConnection;

  ngOnInit() {
    // MARK: Video Handling
    // get local stream, show it in self-view and add it to be sent
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    });

    this.socket = io.connect(
      "https://localhost:4201",
      { secure: true }
    );

    this.socket.on("Open", message => {
      console.log("first member, id:", message.memberID, ", waiting for other peer...");
    });

    this.socket.on("NewMember", message => {
      console.log("detect new peer join, sending offer");
      this.createOffer().catch(error => {
        this.isSuccessAccessVideo = false;
        this.errorMessage = error;
        console.error(error);
      });
    });

    // let the "negotiationneeded" event trigger offer generation
    this.peerConnection.onnegotiationneeded = () => {
      this.createOffer().catch(error => {
        this.isSuccessAccessVideo = false;
        this.errorMessage = error;
        console.error(error);
      });
    };

    this.socket.on("offer", message => {
      const desc: RTCSessionDescription = JSON.parse(message);
      this.peerConnection
        .setRemoteDescription(desc)
        .then(() => {
          return this.peerConnection.createAnswer();
        })
        .then(answer => {
          return this.peerConnection.setLocalDescription(answer);
        })
        .then(() => {
          this.socket.emit(
            "answer",
            JSON.stringify(this.peerConnection.localDescription)
          );
        })
        .catch(error => {
          this.isSuccessAccessVideo = false;
          this.errorMessage = error;
          console.error(error);
        });
    });

    this.socket.on("answer", message => {
      this.peerConnection
        .setRemoteDescription(JSON.parse(message))
        .catch(error => {
          this.isSuccessAccessVideo = false;
          this.errorMessage = error;
          console.error(error);
        });
    });

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: false
      })
      .then(stream => {
        stream
          .getTracks()
          .forEach(track => this.peerConnection.addTrack(track, stream));

        this.isSuccessAccessVideo = true;
        this.errorMessage = "Sending Videos...";

        return this.createOffer();
      })
      .catch(error => {
        this.isSuccessAccessVideo = false;
        this.errorMessage = error;
        console.error(error);
      });
  }

  createOffer() {
    return this.peerConnection
      .createOffer()
      .then(offer => {
        return this.peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        this.socket.emit(
          "offer",
          JSON.stringify(this.peerConnection.localDescription)
        );
      });
  }
}
