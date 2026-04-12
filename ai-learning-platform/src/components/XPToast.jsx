import { toast } from "react-hot-toast";

export default function XPToast(message) {
  toast(message, {
    icon: "⚡",
    style: {
      background: "#1a0f35",
      color: "#c4b5fd",
      border: "1px solid #7c3aed",
      fontSize: "0.85rem",
    },
    duration: 2500,
  });
}
