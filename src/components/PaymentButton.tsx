import API from "../services/api";

type Props = {
  memberId: string;
  groupId: string;
  month: number;
  onSuccess: () => void;
  disabled?: boolean;
};

const PaymentButton = ({
  memberId,
  groupId,
  month,
  onSuccess,
  disabled,
}: Props) => {
  const handlePayment = async () => {
    if (disabled) return;

    try {
      await API.post("/payments", {
        memberId,
        groupId,
        month,
      });

      alert("Payment successful");
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Payment error");
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className="pill-button bg-[#2f8f62] px-4 py-2 text-sm text-white disabled:opacity-50"
    >
      Mark Paid
    </button>
  );
};

export default PaymentButton;
