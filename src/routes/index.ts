import { Router } from "express";
const fs = require("fs");

export class Routes {
  constructor(router: Router) {
    this.loadRoutes(router);
  }

  private loadRoutes(router: Router) {
    const routeFiles = fs.readdirSync(__dirname);

    routeFiles.forEach((file: any) => {
      if (file !== "index{.ts,.js}" && file.endsWith("{.ts,.js}")) {
        const requireClass = require(`./${file}`);
        const RouteClass: any = Object.values(requireClass)[0];
        new RouteClass(router);
      }
    });
  }
}
