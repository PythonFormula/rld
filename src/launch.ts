import { parse } from "yaml";

interface LaunchFileEvent {
  time: string;
  name: string;
}

interface LaunchFile {
  mission_name: string;
  launch_time: string;
  timeline: LaunchFileEvent[];
}

export class LaunchEvent {
  name!: string;
  time!: number;
  constructor(name: string, time: number) {
    this.name = name;
    this.time = time;
  }
}

function parseTOffset(text: string): number {
  let time: number = 0;
  let chars: string = "";
  const units: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  for (const c of text.slice(2)) {
    if (c in units) {
      time += Number(chars) * units[c];
      chars = "";
    } else {
      chars += c;
    }
  }
  if (text.at(1) === "-") {
    time = -time;
  }
  return time;
}

export class Launch {
  name!: string;
  time!: Date;
  originalTime!: Date;
  timeline!: LaunchEvent[];
  holdStarted?: Date;
  delayOffset!: number;

  constructor(fileContent: string) {
    const parsed: LaunchFile = parse(fileContent);
    this.name = parsed.mission_name;
    this.time = new Date(parsed.launch_time);
    this.originalTime = new Date(parsed.launch_time);
    this.timeline = parsed.timeline.map(
      (e) => new LaunchEvent(e.name, parseTOffset(e.time) * 1000),
    );
    this.delayOffset = 0;
  }

  recycle(t: number = 60) {
    this.time = new Date(new Date().getTime() + 1000 * t);
    if (this.holdStarted != null) {
      this.holdStarted = new Date();
    }
  }

  getTime() {
    if (this.holdStarted == null) {
      return new Date(this.time.getTime() + this.delayOffset * 1000);
    }
    return new Date(
      this.time.getTime() +
        Date.now() -
        this.holdStarted.getTime() +
        this.delayOffset * 1000,
    );
  }

  toggleHold() {
    if (this.holdStarted == null) {
      this.holdStarted = new Date();
    } else {
      this.time = this.getTime();
      this.holdStarted = undefined;
    }
  }

  nextEventIndex() {
    let i = 0;
    for (const e of this.timeline) {
      if (new Date(this.time.getTime() + e.time) > new Date()) {
        return i;
      }
      i++;
    }
  }
}
