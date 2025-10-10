import React, { useState, useEffect, useRef } from 'react';
import { getAddressSuggestions, getFeatureDetails, getCoordinates } from '../../utils/mapUtils';

const AddressAutocomplete = ({ 
  placeholder = "Enter an address...",
  onAddressSelect,
  className = "w-full",
  disabled = false,
  userLocation = null
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [sessionToken, setSessionToken] = useState(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const fetchSuggestions = async (searchQuery) => {
    try {
      setIsLoading(true);
      
      // Generate session token if not exists
      if (!sessionToken) {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
        setSessionToken(uuid);
      }
      
      const results = await getAddressSuggestions(
        searchQuery, 
        userLocation?.latitude, 
        userLocation?.longitude, 
        sessionToken
      );
      
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

    const handleSuggestionClick = async (suggestion) => {
      setQuery(suggestion.formatted);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      try {
        // If suggestion has coordinates directly (from old API), use them
        if (suggestion.latitude && suggestion.longitude && 
            !isNaN(suggestion.latitude) && !isNaN(suggestion.longitude)) {
          if (onAddressSelect) {
            onAddressSelect({
              address: suggestion.formatted,
              latitude: suggestion.latitude,
              longitude: suggestion.longitude,
              formatted_address: suggestion.formatted
            });
          }
        } else if (suggestion.mapbox_id && sessionToken) {
          // Use Search Box API to get detailed coordinates
          const featureDetails = await getFeatureDetails(suggestion.mapbox_id, sessionToken);
          // Validate coordinates before using them
          if (featureDetails.latitude && featureDetails.longitude && 
              !isNaN(featureDetails.latitude) && !isNaN(featureDetails.longitude)) {
            if (onAddressSelect) {
              onAddressSelect({
                address: featureDetails.formatted,
                latitude: featureDetails.latitude,
                longitude: featureDetails.longitude,
                formatted_address: featureDetails.formatted,
                feature_type: featureDetails.feature_type,
                accuracy: featureDetails.accuracy
              });
            }
          } else {
            console.error('❌ Invalid coordinates received from getFeatureDetails');
            // Fallback to old method if coordinates are invalid
            const coordinates = await getCoordinates(suggestion.formatted);
            if (onAddressSelect) {
              onAddressSelect({
                address: suggestion.formatted,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                formatted_address: suggestion.formatted
              });
            }
          }
        } else {
          // Fallback: try to get coordinates using the old method
          const coordinates = await getCoordinates(suggestion.formatted);
          if (coordinates && coordinates.latitude && coordinates.longitude && 
              !isNaN(coordinates.latitude) && !isNaN(coordinates.longitude)) {
            if (onAddressSelect) {
              onAddressSelect({
                address: suggestion.formatted,
                latitude: coordinates.latitude,
                longitude: coordinates.longitude,
                formatted_address: suggestion.formatted
              });
            }
          } else {
            console.error('❌ Failed to get valid coordinates for suggestion:', suggestion);
          }
        }
      } catch (error) {
        console.error('❌ Error selecting suggestion:', error);
      }
    };

  // Helper function to get distance color based on distance
  const getDistanceColor = (distance) => {
    if (!distance) return 'text-gray-500';
    if (distance <= 1) return 'text-green-600';
    if (distance <= 5) return 'text-yellow-600';
    return 'text-gray-800';
  };

  // Helper function to format distance text
  const formatDistance = (distance) => {
    if (!distance) return '';
    if (distance <= 1) return `${distance.toFixed(1)} km`;
    if (distance <= 5) return `${distance.toFixed(1)} km`;
    return `${distance.toFixed(1)} km`;
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Clear button */}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              } ${index === 0 ? 'rounded-t-lg' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <span className="truncate block">{suggestion.formatted}</span>
                  {suggestion.distance && (
                    <span className={`text-xs ${getDistanceColor(suggestion.distance)}`}>
                      {formatDistance(suggestion.distance)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && query.length >= 3 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No addresses found for "{query}"
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;

