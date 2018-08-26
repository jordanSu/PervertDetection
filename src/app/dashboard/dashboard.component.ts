import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import * as Chartist from "chartist";

import { ChartComponent } from "angular2-chartjs";
import Chart from 'chart.js';
import '../../assets/js/tracking-min.js';
import '../../assets/js/face-min.js';
declare var tracking: any;

import * as io from "socket.io-client";

@Component({
  moduleId: module.id,
  templateUrl: "dashboard.component.html",
  styleUrls: ["./dashboard.component.css"]
})
export class DashboardComponent implements OnInit {
  @ViewChild("VideoContent")
  videoContent: ElementRef;

  @ViewChild("VideoContainer")
  videoContainer: ElementRef;

  // 長條圖: 可疑係數
  @ViewChild("ct")
  chart: ChartComponent;

  // 甜甜圈圖: 總體可疑係數
  @ViewChild("ct1")
  chart1: ChartComponent;

  @ViewChild("test")
  donut: ElementRef;

  socket: SocketIOClient.Socket;
  peerConnection: RTCPeerConnection;

  isSuccessAccessVideo = true;

  errorMessage: string = null;

  totalPercentage = 40;

  // 現在時間
  currentTime: Date;

  type = "horizontalBar";

  data = {
    labels: ["臉部", "行為"],
    datasets: [
      {
        label: "可疑指數",
        data: [47, 66],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)"
          /*
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
          */
        ]
      }
    ]
  };
  options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      xAxes: [
        {
          barThickness: 30,
          ticks: {
            min: 0,
            max: 100
          }
        }
      ]
    },
    legend: {
      display: false
    }
  };

  donut_type = "doughnut";

  donut_data = {
    datasets: [{
        data: [this.totalPercentage, 100 - this.totalPercentage],
        backgroundColor: [
          "#5cb85c",
          "#ddd"
        ]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["Red", "Yellow"]
  };

  donut_options = {
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      display: false
    },
    elements: {
      center: {
        text: "60%",
        color: "#36A2EB",
        fontStyle: "Helvetica",
        sidePadding: 15 // Default 20 (as a percentage)
      }
    },
    // donut 厚度
    cutoutPercentage: 70,
    // segmentShowStroke : false,
    // animation : false
  };

  updateDonutChart() {
    if (this.totalPercentage < 100 && this.totalPercentage > 0) {
      this.donut_data.datasets[0].data[0] = this.totalPercentage;
      this.donut_data.datasets[0].data[1] = 100 - this.totalPercentage;
      if (this.totalPercentage > 70) {
        this.donut_data.datasets[0].backgroundColor[0] = "#b85c5c";
      } else if (this.totalPercentage > 50) {
        this.donut_data.datasets[0].backgroundColor[0] = "#b8b85c";
      } else {
        this.donut_data.datasets[0].backgroundColor[0] = "#5cb85c";
      }
      this.chart1.chart.update(500);
    }
  }

  initTracking() {
    const objects = new tracking.ObjectTracker(['face']);
    objects.on('track', function(event) {
      if (event.data.length === 0) {
        // No objects were detected in this frame.
      } else {
        event.data.forEach(function(rect) {
          // rect.x, rect.y, rect.height, rect.width
          this.totalPercentage += 0.5;
        });
      }
    });
    tracking.track('#myVideo', objects);
  }

  ngOnInit() {
    // 設定時鐘每秒更新
    setInterval(() => {
      this.currentTime = new Date();
      // this.totalPercentage += 1;
      this.updateDonutChart();
    }, 1000);

    // this.chart1.chart.fillText('60%');
    /*
    setInterval(() => {
      this.data.datasets[0].data[1]++;
      this.chart.chart.update();
    },1000);
    */
    // MARK: Video Handling
    this.startWebRTC();

    const responsiveOptions: any[] = [
      [
        "screen and (max-width: 640px)",
        {
          seriesBarDistance: 5,
          axisX: {
            labelInterpolationFnc: function(value) {
              return value[0];
            }
          }
        }
      ]
    ];

    const dataPreferences = {
      series: [[25, 30, 20, 25]]
    };

    const optionsPreferences = {
      donut: true,
      donutWidth: 40,
      startAngle: 0,
      total: 100,
      showLabel: false,
      axisX: {
        showGrid: false
      }
    };

    const chartPreferences1 = new Chartist.Pie(
      "#chartPreferences",
      dataPreferences,
      optionsPreferences
    );

    const chartPreferences2 = new Chartist.Pie("#chartPreferences", {
      labels: ["62%", "32%", "6%"],
      series: [62, 32, 6]
    });
  }

  startWebRTC() {
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
        console.error(error);
      });
    });

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302"
        }
      ]
    });

    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      this.socket.emit("icecandidate", event.candidate);
    };

    // let the "negotiationneeded" event trigger offer generation
    this.peerConnection.onnegotiationneeded = event => {
      this.createOffer()
        .catch(error => {
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
          console.error(error);
        });
    });

    this.socket.on("answer", message => {
      this.peerConnection
        .setRemoteDescription(JSON.parse(message))
        .catch(error => {
          console.error(error);
        });
    });

    // once remote track media arrives, show it in remote video element
    this.peerConnection.ontrack = (event: RTCTrackEvent) => {
      this.isSuccessAccessVideo = true;
      this.errorMessage = "Playing Video";
      // don't set srcObject again if it is already set.
      if (this.videoContent.nativeElement.srcObject) {
        return;
      }
      this.videoContent.nativeElement.srcObject = event.streams[0];
    };
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
