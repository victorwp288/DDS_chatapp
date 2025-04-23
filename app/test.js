import { verifyInstallation } from "nativewind";

export default function Test() {
  verifyInstallation(); // shows a log + throws if something is wrong
  return null;
}
