import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import * as Chartist from "chartist";
import Chart from 'chart.js';

@Component({
  selector: "dashboard-cmp",
  moduleId: module.id,
  templateUrl: "dashboard.component.html",
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild("VideoContent")
  videoContent: ElementRef;

  @ViewChild("VideoContainer")
  videoContainer: ElementRef;

  @ViewChild("test") donut: ElementRef;

  isSuccessAccessVideo = true;

  errorMessage: string = null;

  type = 'horizontalBar';
  data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        data: [65, 59, 80, 81, 56, 55, 40]
      }
    ]
  };
  options = {
    
    
    layout: {
      padding: {
          left: 0,
          right: 50,
          top: 0,
          bottom: 0
      }
    }
  };

  ngOnInit() {

    

    // MARK: Video Handling
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            width: { exact: 640 },
            height: { exact: 480 }
          },
          audio: false
        })
        .then(stream => {
          this.isSuccessAccessVideo = true;
          const videoElement = this.videoContent.nativeElement;
          videoElement.src = window.URL.createObjectURL(stream);
          videoElement.play();
        })
        .catch(error => {
          this.isSuccessAccessVideo = false;
          this.errorMessage = error;
        });
    } else {
      this.isSuccessAccessVideo = false;
      this.errorMessage = "不支援影像播放";
    }

    // MARK: Chart Handling
    const dataSales = {
      labels: [
        "9:00AM",
        "12:00AM",
        "3:00PM",
        "6:00PM",
        "9:00PM",
        "12:00PM",
        "3:00AM",
        "6:00AM"
      ],
      series: [
        [287, 385, 490, 562, 594, 626, 698, 895, 952],
        [67, 152, 193, 240, 387, 435, 535, 642, 744],
        [23, 113, 67, 108, 190, 239, 307, 410, 410]
      ]
    };

    const optionsSales = {
      low: 0,
      high: 1000,
      showArea: true,
      height: "245px",
      axisX: {
        showGrid: false
      },
      lineSmooth: Chartist.Interpolation.simple({
        divisor: 3
      }),
      showLine: true,
      showPoint: false
    };

    const responsiveSales: any[] = [
      [
        "screen and (max-width: 640px)",
        {
          axisX: {
            labelInterpolationFnc: function(value) {
              return value[0];
            }
          }
        }
      ]
    ];

    // const chartHours = new Chartist.Line(
    //   "#chartHours",
    //   dataSales,
    //   optionsSales,
    //   responsiveSales
    // );

    const data = {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mai",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ],
      series: [
        [542, 543, 520, 680, 653, 753, 326, 434, 568, 610, 756, 895],
        [230, 293, 380, 480, 503, 553, 600, 664, 698, 710, 736, 795]
      ]
    };

    const options = {
      seriesBarDistance: 10,
      axisX: {
        showGrid: false
      },
      height: "245px"
    };

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

    const chartActivity = new Chartist.Line(
      "#chartActivity",
      data,
      options,
      responsiveOptions
    );

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
}
