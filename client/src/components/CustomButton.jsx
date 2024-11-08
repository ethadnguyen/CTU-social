const CustomButton = ({ title, containerStyles, iconRight, type, onClick }) => {
  return (
    <button
      onClick={onClick}
      type={type || "button"}
      className={`inline-flex items-center text-base ${containerStyles}`}
    >
      <span className='whitespace-nowrap'>{title}</span>

      {iconRight && <div className='ml-2'>{iconRight}</div>}
    </button>
  );
};

export default CustomButton;
