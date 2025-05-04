import React from 'react';
import countryList from '../utils/countryList';

const CountryFlag = ({ countryCode }) => {
    const country = countryList.find(country => country.code === countryCode);

    if (!country) return <span>Unknown Country</span>;

    return (
        <div className="country-flag">
            <img
                src={`/src/assets/images/flags/${countryCode.toLowerCase()}.svg`}
                alt={`${country.name} flag`}
                className="flag-icon"
            />
            <span className="country-name">{country.name}</span>
        </div>
    );
};

export default CountryFlag;