import { TextStyle } from "react-native";

export const Typography: Record<
  "H1" | "H2" | "H3" | "Body" | "BodyMedium" | "Label" | "Caption" | "Mono",
  TextStyle
> = {
  H1: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 34,
  },
  H2: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  H3: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  Body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
  },
  BodyMedium: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  Label: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  Caption: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  Mono: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    fontVariant: ["tabular-nums"],
  },
};
