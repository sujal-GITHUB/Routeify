// Token management utility
export const TokenManager = {
  // Set token with expiration
  setToken: (tokenName, token, expirationHours = 24) => {
    const expirationTime = Date.now() + (expirationHours * 60 * 60 * 1000);
    const tokenData = {
      token,
      expiration: expirationTime
    };
    localStorage.setItem(tokenName, JSON.stringify(tokenData));
  },

  // Get token if not expired
  getToken: (tokenName) => {
    try {
      const tokenData = localStorage.getItem(tokenName);
      if (!tokenData) return null;

      const parsed = JSON.parse(tokenData);
      if (Date.now() > parsed.expiration) {
        localStorage.removeItem(tokenName);
        return null;
      }
      return parsed.token;
    } catch (error) {
      console.error('Error parsing token:', error);
      localStorage.removeItem(tokenName);
      return null;
    }
  },

  // Remove token
  removeToken: (tokenName) => {
    localStorage.removeItem(tokenName);
  },

  // Check if token exists and is valid
  isTokenValid: (tokenName) => {
    return this.getToken(tokenName) !== null;
  },

  // Clear all tokens
  clearAllTokens: () => {
    localStorage.removeItem('usertoken');
    localStorage.removeItem('captaintoken');
  }
};

// Auto-cleanup expired tokens on app start
export const initializeTokenCleanup = () => {
  // Check and clean user token
  TokenManager.getToken('usertoken');
  // Check and clean captain token
  TokenManager.getToken('captaintoken');
};

