import API from "../services/api";

type Props = {
  memberId: string;
  groupId: string;
  month: number;
  onSuccess: () => void;
};

const PaymentButton = ({ memberId, groupId, month, onSuccess }: Props) => {
  const handlePayment = async () => {
    try {
      await API.post("/payments", {
        memberId,
        groupId,
        month,
      });

      alert("Payment successful 💰");
      onSuccess();
    } catch (err: any) {
      alert(err.response?.data?.message || "Payment error");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-500 text-white px-3 py-1 rounded-lg active:scale-95 transition"
    >
      Paid
    </button>
  );
};

export default PaymentButton;
