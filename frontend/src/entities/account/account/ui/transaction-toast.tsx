import { ExplorerLink } from "@/entities/cluster/cluster";
import toast from "react-hot-toast";

export const useTransactionToast = () => (signature: string) => {
  toast.success(
    <div className={"text-center"}>
      <div className="text-lg">Transaction sent</div>
      <ExplorerLink
        path={`tx/${signature}`}
        label={"View Transaction"}
        className="btn btn-xs btn-primary"
      />
    </div>
  );
};
