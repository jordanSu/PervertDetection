import { Component, OnInit, ViewChild, ElementRef, HostListener } from "@angular/core";
import * as Chartist from "chartist";
import { ChartComponent } from "angular2-chartjs";
// import Chart from 'chart.js';
import '../../assets/js/tracking-min.js';
import '../../assets/js/face-min.js';

declare var tracking: any;
declare var Chart: any;

const BAR_MIN = 10;
const BAR_MAX = 95;

@Component({
  moduleId: module.id,
  templateUrl: "dashboard.component.html",
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild("VideoContent")
  videoContent: ElementRef;

  @ViewChild("VideoContainer")
  videoContainer: ElementRef;

  // 長條圖: 可疑係數
  @ViewChild("ct") chart: ChartComponent;

  // 甜甜圈圖: 總體可疑係數
  @ViewChild("ct1") chart1: ChartComponent;

  @ViewChild("mycanvas") canvas: ElementRef;

  @ViewChild("test") donut: ElementRef;

  context: CanvasRenderingContext2D;

  isSuccessAccessVideo = true;

  errorMessage: string = null;

  // 特徵係數初始化
  facePercentage = 30;
  behaviorPercentage = 20;
  totalPercentage = this.facePercentage + this.behaviorPercentage;

  // 現在時間
  currentTime: Date;

  type = 'horizontalBar';

  data = {
    labels: ["臉部", "行為"],
    datasets: [
      {
        label: "特徵係數",
        data: [this.facePercentage, this.behaviorPercentage],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
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

  donut_type = 'doughnut';

  donut_data = {
    datasets: [{
        data: [this.totalPercentage, 100 - this.totalPercentage],
        backgroundColor: [
          "#5cb85c",
          "#ddd"
        ]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        '可疑係數',
        '',
    ]
  };

  donut_options = {
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      display: false
    },
    // donut 厚度
    cutoutPercentage: 70,
    // segmentShowStroke : false,
    // animation : false
  };

  updateDonutChart() {
    this.totalPercentage = this.facePercentage * 0.5 + this.behaviorPercentage * 0.5;
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
      this.chart1.chart.update(300);
    }
  }

  updateBarChart() {
    this.data.datasets[0].data[0] = this.facePercentage;
    this.data.datasets[0].data[1] = this.behaviorPercentage;
    this.chart.chart.update(300);
  }

  initTracking() {
    this.context = this.canvas.nativeElement.getContext('2d');
    console.log(this.chart1);
    const objects = new tracking.ObjectTracker(['face']);
    objects.setInitialScale(3);
    objects.setStepSize(1);
    objects.setEdgesDensity(0.1);
    objects.on('track', (event) => {
      this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      if (event.data.length === 0) {
        // No objects were detected in this frame.
        this.addFacePercentage(-0.5);
        this.addBehaviorPercentage(-0.5);
        console.log('nothing happen');
      } else {
        event.data.forEach((rect) => {
          // rect.x, rect.y, rect.height, rect.width
          this.addFacePercentage(1);
          this.addBehaviorPercentage(1);
          console.log('this is good');
          this.context.strokeStyle = '#a64ceb';
          this.context.strokeRect(rect.x, rect.y, rect.width, rect.height);
          this.context.font = '11px Helvetica';
          this.context.fillStyle = "#fff";
          this.context.fillText('臉部', rect.x + rect.width + 5, rect.y + 11);
          // this.context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
          // this.context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
        });
      }
    });
    tracking.track('#myVideo', objects);
  }

  ngOnInit() {
    // 設定時鐘每秒更新
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    // 設定chart更新
    setInterval(() => {
      this.updateBarChart();
      this.updateDonutChart();
    }, 500);
    // this.chart1.chart.fillText('60%');

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
          videoElement.srcObject = stream;
          videoElement.play();
          this.initTracking();
        })
        .catch(error => {
          this.isSuccessAccessVideo = false;
          this.errorMessage = error;
        });
    } else {
      this.isSuccessAccessVideo = false;
      this.errorMessage = "不支援影像播放";
    }

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

  updateDonutText() {
    const width = this.chart1.chart.chart.width;
    const height = this.chart1.chart.chart.height;
    const ctx = this.chart1.chart.chart.ctx;

    // ctx.restore();
    const fontSize = 6; // (height / 114).toFixed(2);
    ctx.font = fontSize + "em sans-serif";
    ctx.textBaseline = "middle";

    const text = Math.round(this.totalPercentage) + "%";
    const textX = Math.round((width - ctx.measureText(text).width) / 2);
    const textY = height / 2;

    ctx.clearRect(textX, textY, ctx.measureText(text).width, ctx.measureText(text).height);
    ctx.fillText(text, textX, textY);
    // ctx.save();
  }

  addFacePercentage(num: number) {
    if (this.facePercentage + num > BAR_MIN && this.facePercentage + num < BAR_MAX) {
      this.facePercentage += num;
    }
  }

  addBehaviorPercentage(num: number) {
    if (this.behaviorPercentage + num > BAR_MIN && this.behaviorPercentage + num < BAR_MAX) {
      this.behaviorPercentage += num;
    }
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    console.log(event.key);
    if (event.key === 'q') {
      this.addFacePercentage(10);
    } else if (event.key === 'a') {
      this.addFacePercentage(-10);
    } else if (event.key === 'w') {
      this.addBehaviorPercentage(10);
    } else if (event.key === 's') {
      this.addBehaviorPercentage(-10);
    }
  }
}
