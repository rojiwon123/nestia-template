import { getCurrentInvoke } from "@codegenie/serverless-express";
import { isString } from "@fxts/core";
import { InspectOptions, inspect } from "util";
import winston from "winston";

import { Make } from "@/util/make";

import { Config, config } from "./config";

export type LogLevelType = "FATAL" | "ERROR" | "WARN" | "INFO" | "DEBUG" | "TRACE";

/// 로그 메시지 형식을 맞추기 위한 함수들입니다.

const inspectOptions = ({ level, colors }: { level: string; colors: boolean }): InspectOptions => {
    switch (level) {
        case "FATAL":
        case "ERROR":
        case "WARN":
            return { colors, sorted: false, depth: null };
        case "INFO":
            return { colors, sorted: false };
        case "DEBUG":
        case "TRACE":
            return { colors, sorted: false, depth: null, showHidden: true, showProxy: true, maxArrayLength: null, numericSeparator: true };
        default:
            return { colors };
    }
};

const stringify = ({ colors = false }: { colors?: boolean } = {}) =>
    winston.format((info) => {
        const message: unknown = info.message;
        info.message =
            Array.isArray(message) ?
                message.map((input) => (isString(input) ? input : inspect(input, inspectOptions({ level: info.level, colors })))).join(" ")
            : isString(message) ? message
            : inspect(message, inspectOptions({ level: info.level, colors }));
        return info;
    })();

const LOCAL_TRANSPORTS = () => [
    new winston.transports.Stream({
        stream: process.stdout,
        format: winston.format.combine(
            stringify({ colors: true }),
            winston.format.colorize({
                level: true,
                colors: {
                    TRACE: "gray",
                    DEBUG: "gray",
                    INFO: "green",
                    WARN: "yellow",
                    ERROR: "blue",
                    FATAL: "red",
                } satisfies Record<Exclude<LogLevelType, "ALL" | "OFF">, "red" | "blue" | "yellow" | "green" | "gray" | "white">,
            }),
            winston.format.printf(
                (info) => `[${info.level}] ${new Date().toLocaleString("ko", { timeZone: "Asia/Seoul" })} ${info.message}`,
            ),
        ),
    }),
];

const LAMBDA_TRANSPORTS = () => [
    new winston.transports.Stream({
        stream: process.stdout,
        format: winston.format.combine(
            stringify({ colors: false }),
            winston.format.printf(
                (info) =>
                    `[${info.level}] ${new Date().toISOString()} ${getCurrentInvoke().context?.awsRequestId}\r` +
                    `${info.message}`.replaceAll("\n", "\r"),
            ),
        ),
    }),
];

const winstonLogger = Make.once(() =>
    winston.createLogger({
        levels: { FATAL: 0, ERROR: 1, WARN: 2, INFO: 3, DEBUG: 4, TRACE: 5 } satisfies Record<Exclude<LogLevelType, "ALL" | "OFF">, number>,
        level: config("LOG_LEVEL"),
        transports: config("AWS_EXECUTION_ENV")?.startsWith("AWS_Lambda") ? LAMBDA_TRANSPORTS() : LOCAL_TRANSPORTS(),
    }),
);

export const logger =
    (level: Exclude<Lowercase<Config["LOG_LEVEL"]>, "all" | "off"> = "info") =>
    (...message: unknown[]) => {
        winstonLogger().log(level.toUpperCase(), { message });
    };
