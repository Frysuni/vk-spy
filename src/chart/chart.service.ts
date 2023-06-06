import { resolve } from "node:path";
import { openSync, readSync, statSync } from "node:fs";
import { Injectable } from "@nestjs/common";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

@Injectable()
export class ChartService {
  private readonly filePath = resolve(__dirname, '../', '../', '.chartData');
  private readonly chunkLength = '2023-06-03T02:34:00.475Z=0|'.length;

  public createChart(
    whenDone: (image: Buffer) => any,
  ): {
    datasetSize: number,
    datasetReaded: () => number,
  } {
    const chart = new ChartJSNodeCanvas({
      type: 'svg',
      width: 800,
      height: 600,
      backgroundColour: 'white',
    });

    const configuration: Parameters<typeof chart['renderToBufferSync']>[0] = {
      type: 'line',
      data: {
        datasets: [{
          label: 'June 9, 2019 is a hint, but you can check the file attributes',
          data: [],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          pointBorderWidth: 0,
        }],
      },
      options: {
        scales: {
          x: {
            ticks: {
              display: true,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              display: false,
            },
          },
        },
      },
    };

    function dataToChart(bigData: Map<string, number>) {
      const hoursIsEven = (key: string): boolean => Number(key.substring(0, 2)) % 2 === 0;
      const zeroizeMinutes = (key: string): string => key.substring(0, 2) + ':00';
      const minusOneHourAndZeroizeMinutes = (key: string): string => (Number(key.substring(0, 2)) - 1).toString().padStart(2, '0') + ':00';

      configuration.data.labels = Array.from(bigData.keys())
        .map((key) =>
          hoursIsEven(key)
            ? zeroizeMinutes(key)
            : minusOneHourAndZeroizeMinutes(key),
        );

      configuration.data.datasets[0].data = Array.from(bigData.values());

      return whenDone(
        chart.renderToBufferSync(configuration, 'image/png'),
      );
    }

    return this.getData(dataToChart);
  }

  private getData(
    whenDone: (bigData: Map<string, number>) => void,
  ): {
    datasetSize: number,
    datasetReaded: () => number,
  } {
    const file = openSync(this.filePath, 'r');
    const readBuffer = Buffer.alloc(this.chunkLength);

    let bytesRead: number;
    let position = 0;

    const bigData = new Map<string, number>();

    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes++) {
        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        bigData.set(formattedTime, 0);
      }
    }

    const interval: NodeJS.Timer = setInterval(() => {
      bytesRead = readSync(file, readBuffer, 0, this.chunkLength, position);
      position += bytesRead;

      const chunk = readBuffer.toString('utf8', 0, bytesRead);
      if (chunk == '') return clearInterval(interval), whenDone(bigData);

      const [dateStr, onlineStr] = chunk.replace('|', '').split('=');
      const online = Boolean(Number(onlineStr));
      const date = new Date(dateStr);

      const hours   = date.getHours()  .toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;

      bigData.set(formattedTime, bigData.get(formattedTime)! + (online ? 1 : -1));
    });

    return {
      datasetSize: statSync(this.filePath).size / this.chunkLength,
      datasetReaded: () => position / this.chunkLength,
    };
  }
}