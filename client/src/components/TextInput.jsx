import React from "react";
import PropTypes from "prop-types";
import { Input } from './ui/input';
import { Label } from './ui/label';
const TextInput = React.forwardRef(
    (
        { type, placeholder, styles, label, labelStyles, register, name, error },
        ref
    ) => {
        return (
            <div className='flex flex-col w-full mt-2'>
                {label && (
                    <Label htmlFor={name} className={`text-ascent-2 text-sm mb-2 cursor-pointer ${labelStyles}`}>{label}</Label>
                )}

                <div>
                    <Input
                        type={type}
                        id={name}
                        name={name}
                        placeholder={placeholder}
                        ref={ref}
                        className={`bg-secondary rounded border border-[#66666690] outline-none text-sm text-ascent-1 px-4 py-3 placeholder:text-[#666] ${styles}`}
                        {...register}
                        aria-invalid={error ? "true" : "false"}
                    />
                </div>
                {error && (
                    <span className='text-xs text-[#f64949fe] mt-0.5 '>{error}</span>
                )}
            </div>
        );
    }
);

TextInput.displayName = "TextInput";

TextInput.propTypes = {
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
    styles: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    labelStyles: PropTypes.string.isRequired,
    register: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    error: PropTypes.string.isRequired,
};

export default TextInput;