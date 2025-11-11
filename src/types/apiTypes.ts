// types/ApiTypes.ts

export class ApiResponse {
  status: number;
  data: any;
  method: string;
  employeeId?: string;

  constructor(
    status: number,
    data: any,
    method: string,
    employeeId?: string
  ) {
    this.status = status;
    this.data = data;
    this.method = method;
    if (employeeId) this.employeeId = employeeId;
  }
}

export class PostData {
  title: string;
  body: string;
  userId: number;
  [key: string]: any;

  constructor(title: string, body: string, userId: number, extraData?: Record<string, any>) {
    this.title = title;
    this.body = body;
    this.userId = userId;

    if (extraData) {
      Object.assign(this, extraData);
    }
  }
}

export class AttendanceData {
  userId: number;
  date: string;
  status: "present" | "absent" | "leave";
  [key: string]: any;
  employeeId?: string;

  constructor(
    userId: number,
    date: string,
    status: "present" | "absent" | "leave",
    extraData?: Record<string, any>
  ) {
    this.userId = userId;
    this.date = date;
    this.status = status;

    if (extraData) {
      Object.assign(this, extraData);
    }
  }
}
