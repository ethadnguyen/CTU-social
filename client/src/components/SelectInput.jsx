import React from "react";
import PropTypes from "prop-types";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";

const SelectInput = React.forwardRef(
    ({ name, label, labelStyles, styles, options, register, error, placeholder }, ref) => {

        return (
            <div className="flex flex-col w-full mt-2">
                {label && (
                    <Label
                        htmlFor={name}
                        className={`text-ascent-2 text-sm mb-2 cursor-pointer ${labelStyles}`}
                    >
                        {label}
                    </Label>
                )}

                <div>
                    <Select id={name} {...register} ref={ref} name={name} >
                        <SelectTrigger
                            className={`bg-secondary rounded border border-[#66666690] outline-none text-sm text-ascent-1 px-4 py-3 ${styles}`}
                        >
                            <SelectValue placeholder={placeholder} className={`text-ascent-1 text-sm mb-2 cursor-pointer ${labelStyles}`} />
                        </SelectTrigger>
                        <SelectContent className='bg-primary'>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {error && (
                    <span className="text-xs text-[#f64949fe] mt-0.5">{error}</span>
                )}
            </div>
        );
    }
);

SelectInput.displayName = "SelectInput";

SelectInput.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    labelStyles: PropTypes.string.isRequired,
    styles: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    register: PropTypes.func.isRequired,
    error: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired,
};

export default SelectInput;