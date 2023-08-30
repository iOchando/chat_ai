import path from "path";
import swaggerJSDoc, { OAS3Definition, OAS3Options } from "swagger-jsdoc";

const swaggerDefinition: OAS3Definition = {
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

const swaggerOptions: OAS3Options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../routes/{routes,routes.*}{.ts,.js}")],
};

export default swaggerJSDoc(swaggerOptions);
