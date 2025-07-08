// Creator: Grafana k6 Browser Recorder 1.0.8
import { epmEnum } from "./epm-utils.ts";
import { check, sleep, group } from "k6";
import http from "k6/http";

export const options = {
  vus: 10,
  duration: "1m",
  insecureSkipTLSVerify: true,
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ['p(95)<2000'], // adjust if needed
    // Optional: add per-group thresholds if using `group()`
  },
};


export default function main() {
  let response;

  group("Login", function () {
    response = http.post(
      `https://172.31.32.64/registration/${epmEnum.CHECK_PASSWORD_URL}`,
      {
        password: epmEnum.PASSWORD,
        username: epmEnum.USERNAME,
      }
    );

    response = http.post(
      `https://172.31.32.64/registration/${epmEnum.ADMIN_UNLOCK_URL}`,
      {
        btnAdminUnLockEmpno: epmEnum.EMPLOYEE_NUMBER,
      }
    );
    check(response, {
      "login status is 200": (r) => r.status === 200,
      "login response time < 500ms": (r) => r.timings.duration < 500,
      "successfully logged in": (r) =>  r.body && r.body.includes("Account Unlocked!"),
    });

    sleep(3.2);
  });

  group("Home Page", () => {
    response = http.get(`https://172.31.32.64/registration/${epmEnum.HOME_PAGE_URL}`);

    response = http.post(`https://172.31.32.64/registration/${epmEnum.GET_INFO_URL}`);

    check(response, {
      "home page status is 200": (r) => r.status === 200,
      "home page response time < 500ms": (r) => r.timings.duration < 500,
      "contains 03-xxxx or 03-xxxxx employee format number": (r) =>
        /03-\d{4,5}/.test(r.body),
    });

    sleep(0.7);
  });

  group("User Management", () => {
    response = http.get(`https://172.31.32.64/registration/${epmEnum.USER_MANAGEMENT_URL}`);

    check(response, {
      "user management status is 200": (r) => r.status === 200,
      "user management title is present": (r) =>
        r.body.includes(
          "<title>User Management - Employee's Registration Module</title>"
        ),
    });
  });

  group("Position", () => {
    response = http.get(`https://172.31.32.64/registration/${epmEnum.POSITION_URL}`);

    check(response, {
      "position status is 200": (r) => r.status === 200,
      "position title is present": (r) =>
        r.body.includes(
          "<title>Position Management - Employee's Registration Module</title>"
        ),
    });
  });

  sleep(1);
}
