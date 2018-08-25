import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import * as Chartist from "chartist";
import { ChartComponent } from "angular2-chartjs";
import Chart from 'chart.js';
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

  @ViewChild("test") donut: ElementRef;

  isSuccessAccessVideo = true;

  errorMessage: string = null;

  totalPercentage = 40;

  // 現在時間
  currentTime: Date;

  type = 'horizontalBar';

  data = {
    labels: ["臉部", "行為"],
    datasets: [
      {
        label: "可疑指數",
        data: [47, 66],
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
        'Red',
        'Yellow',
    ]
  };

  donut_options = {
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      display: false
    },
    elements: {
      center: {
        text: '60%',
        color: '#36A2EB',
        fontStyle: 'Helvetica',
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

  ngOnInit() {
    // 設定時鐘每秒更新
    setInterval(() => {
      this.currentTime = new Date();
      this.totalPercentage += 1;
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

  colorUpdate(): void {
    // TODO: this.chart
  }
}
