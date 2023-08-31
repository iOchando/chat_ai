"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: "Chat AI - Api V1",
        description: "End Points for Chat AI",
        contact: {
            email: "juanochando00@gmail.com",
        },
        version: "1.0.0",
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT}/api/`,
        },
    ],
    tags: [
        {
            name: "User",
            description: "EndPoints asociados a la configuracion del perfil de los usuarios.",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
            },
        },
    },
};
const swaggerOptions = {
    swaggerDefinition,
    apis: [path_1.default.join(__dirname, "../routes/{routes,routes.*}{.ts,.js}")],
};
exports.default = (0, swagger_jsdoc_1.default)(swaggerOptions);
