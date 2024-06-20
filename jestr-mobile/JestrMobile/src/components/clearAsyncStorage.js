const checkAuthStatus = async () => {
  try {
    const userString = await AsyncStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user && user.email) {
        setIsAuthenticated(true);
        navigation.navigate('Feed', { user });
      } else {
        setIsAuthenticated(false);
        console.error('Invalid user data in AsyncStorage');
      }
    } else {
      setIsAuthenticated(false);
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
    setIsAuthenticated(false);
  }
};