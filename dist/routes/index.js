"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const fs = require("fs");
class Routes {
    constructor(router) {
        this.loadRoutes(router);
    }
    loadRoutes(router) {
        const routeFiles = fs.readdirSync(__dirname);
        routeFiles.forEach((file) => {
            if (file !== "index{.ts,.js}" && file.endsWith("{.ts,.js}")) {
                const requireClass = require(`./${file}`);
                const RouteClass = Object.values(requireClass)[0];
                new RouteClass(router);
            }
        });
    }
}
exports.Routes = Routes;
