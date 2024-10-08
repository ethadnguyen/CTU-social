import React from "react";
import PropTypes from "prop-types";

const SelectInput = React.forwardRef(
    ({ label, labelStyles, options, value, onChange, styles, error }, ref) => {
        return (
            <div className="w-full flex flex-col mt-2">
                {label && (
                    <p className={`text-ascent-2 text-sm mb-2 ${labelStyles}`}>
                        {<span className="font-bold">
                            {label}
                        </span>}
                    </p>
                )}

                <div>
                    <select
                        ref={ref}
                        value={value}
                        onChange={onChange}
                        className={`bg-secondary rounded border border-[#66666690] mb-2 outline-none text-sm text-ascent-2 px-4 py-3 placeholder:text-[#666] ${styles}`}
                        aria-invalid={error ? "true" : "false"}
                        required
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                {error && (
                    <span className="text-xs text-[#f64949fe] mt-0.5 ">{error}</span>
                )}
            </div>
        );
    }
);

SelectInput.displayName = "SelectInput";
SelectInput.propTypes = {
    label: PropTypes.string,
    labelStyles: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired,
    styles: PropTypes.string,
    error: PropTypes.string,
};

export default SelectInput;
