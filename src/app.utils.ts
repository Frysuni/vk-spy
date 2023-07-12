import { Injectable } from "@nestjs/common";
import * as svg2imgBadLibExport from "svg2img";

@Injectable()
export class AppUtils {
  private readonly blacklistedItems = ['track_code', 'last_seen', 'online', 'followers_count'];

  public findDifferences(obj1: any, obj2: any, prefix = ''): string[] {
    const differences: string[] = [];

    for (const key in obj1) {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        differences.push(...this.findDifferences(obj1[key], obj2[key], `${prefix}${key}.`));
      } else if (obj1[key] !== obj2[key]) {
        differences.push(`${prefix}${key}: ${obj1[key]} => ${obj2[key]}`);
      }
    }

    for (const key in obj2) {
      if (!(key in obj1)) {
        differences.push(`${prefix}${key}: undefined => ${obj2[key]}`);
      }
    }

    return differences.filter(this.filter.bind(this));
  }

  public formatTime(minutes: number) {
    minutes = Math.floor(minutes);

    const minutesInDay = 24 * 60;
    const minutesInMonth = 30 * minutesInDay;

    const months = Math.floor(minutes / minutesInMonth);
    const days = Math.floor((minutes % minutesInMonth) / minutesInDay);
    const hours = Math.floor((minutes % minutesInDay) / 60);
    const mins = minutes % 60;

    const monthLabel = this.getLabel(months, ['месяц', 'месяца', 'месяцев']);
    const dayLabel = this.getLabel(days, ['день', 'дня', 'дней']);
    const hourLabel = this.getLabel(hours, ['час', 'часа', 'часов']);
    const minLabel = this.getLabel(mins, ['минута', 'минуты', 'минут']);

    let result = '';

    if (months > 0) result += `${months} ${monthLabel} `;
    if (days > 0)   result += `${days} ${dayLabel} `;
    if (hours > 0)  result += `${hours} ${hourLabel} `;
    if (mins > 0)   result += `${mins} ${minLabel} `;

    result = result.trim();

    return Number(result) < 1 ? 'менее минуты' : result;
  }

  public svg2img(image: Buffer): Promise<Buffer> {
    type Format = Exclude<svg2imgBadLibExport.svg2imgOptions['format'], undefined>

    return new Promise(res => {
      (svg2imgBadLibExport as any as typeof svg2imgBadLibExport.default)(image.toString(), { format: 'png' as Format }, (_, buffer) => res(buffer));
    });
  }

  private getLabel(number: number, labels: string[]) {
    const cases = [2, 0, 1, 1, 1, 2];
    const index = (number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5];
    return labels[index];
  }

  private filter(value: string) {
    for (const blacklistedItem of this.blacklistedItems) {
      if (value.includes(blacklistedItem)) return false;
    }
    return true;
  }

}