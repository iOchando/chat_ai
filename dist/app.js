"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
// import swaggerUi from "swagger-ui-express";
// import swaggerSetup from "./config/swagger.config";
// import { UsersModule } from "./modules/users/init";
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.router = express_1.default.Router();
        this.config();
        // this.initRoutes();
    }
    config() {
        this.app.use((0, morgan_1.default)("dev"));
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        // this.app.use("/api", this.router);
        // this.app.use("/uploads", express.static(path.resolve("./uploads/")));
        // this.app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSetup));
    }
}
exports.default = new App().app;