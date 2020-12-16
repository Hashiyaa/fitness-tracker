import React from 'react';

import LoginView from './LoginView';
import SignupView from './SignupView';

import TodayView from './TodayView'
import MealsView from './MealsView'
import ExercisesView from './ExercisesView'
import ProfileView from './ProfileView'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TouchableOpacity, Image, View, Text } from 'react-native';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      accessToken: undefined,
      username: undefined,
      activities: [],
      meals: [],
      foodList: [[]],
      // user information
      goalDailyCalories: 0.0,
      goalDailyProtein: 0.0,
      goalDailyCarbohydrates: 0.0,
      goalDailyFat: 0.0,
      goalDailyActivity: 0.0
    }

    this.login = this.login.bind(this);
    this.revokeAccessToken = this.revokeAccessToken.bind(this);
    this.logoutButton = this.logoutButton.bind(this);
    this.setActivities = this.setActivities.bind(this);
    this.setMeals = this.setMeals.bind(this);
    this.setFoodList = this.setFoodList.bind(this);
    this.setGoals = this.setGoals.bind(this);
  }

  /**
   * Store the username and accessToken here so that it can be
   * passed down to each corresponding child view.
   */
  login(username, accessToken) {
    this.setState({
      accessToken: accessToken,
      username: username
    });
  }

  logout() {
    this.setState({
      accessToken: undefined,
      username: undefined
    })
  }

  /**
   * Revokes the access token, effectively signing a user out of their session.
   */
  revokeAccessToken() {
    this.setState({
      accessToken: undefined
    });
  }

  /**
   * Defines a signout button... Your first TODO!
   */
  logoutButton = () => {
    return <>
      <View style={{ flexDirection: 'row', marginRight: 25 }}>
        <TouchableOpacity onPress={() => this.logout()} accessible={true} accessibilityLabel="Log out" accessibilityRole="button">
          <Ionicons name="ios-exit" size={30} style={{paddingLeft: 10}}/>
        </TouchableOpacity>
      </View>
    </>
  }

  setActivities(activities) {
    this.setState({ activities: activities });
  }

  setMeals(meals) {
    this.setState({ meals: meals });
  }

  setFoodList(foodList) {
    this.setState({ foodList: foodList });
  }

  setGoals(value, type) {
    if (type === "calories") {
      this.setState({ goalDailyCalories: value });
    } else if (type === "protein") {
      this.setState({ goalDailyProtein: value });
    } else if (type === "carbohydrates") {
      this.setState({ goalDailyCarbohydrates: value });
    } else if (type === "fat") {
      this.setState({ goalDailyFat: value });
    } else if (type === "activity") {
      this.setState({ goalDailyActivity: value });
    } else {
      this.setState({ 
        goalDailyCalories: value.calories,
        goalDailyProtein: value.protein,
        goalDailyCarbohydrates: value.carbohydrates,
        goalDailyFat: value.fat,
        goalDailyActivity: value.activity
      });
    }
  }

  /**
   * Note that there are many ways to do navigation and this is just one!
   * I chose this way as it is likely most familiar to us, passing props
   * to child components from the parent.
   * 
   * Other options may have included contexts, which store values above
   * (similar to this implementation), or route parameters which pass
   * values from view to view along the navigation route.
   * 
   * You are by no means bound to this implementation; choose what
   * works best for your design!
   */
  render() {

    // Our primary navigator between the pre and post auth views
    // This navigator switches which screens it navigates based on
    // the existent of an access token. In the authorized view,
    // which right now only consists of the profile, you will likely
    // need to specify another set of screens or navigator; e.g. a
    // list of tabs for the Today, Exercises, and Profile views.
    let AuthStack = createStackNavigator();
    let BottomTab = createBottomTabNavigator();

    return (
      <NavigationContainer>
        <AuthStack.Navigator>
          {!this.state.accessToken ? (
            <>
              <AuthStack.Screen
                name="SignIn"
                options={{
                  title: 'Fitness Tracker Welcome',
                }}
              >
                {(props) => <LoginView {...props} login={this.login} />}
              </AuthStack.Screen>

              <AuthStack.Screen
                name="SignUp"
                options={{
                  title: 'Fitness Tracker Signup',
                }}
              >
                {(props) => <SignupView {...props} />}
              </AuthStack.Screen>
            </>
          ) : (
            <AuthStack.Screen 
              name="FitnessTracker" 
              options={{
                headerLeft: this.logoutButton
              }}
            >
              {(props) => 
                <BottomTab.Navigator {...props} 
                  screenOptions={({ route }) => ({
                    tabBarIcon: ({focused, color, size }) => {
                      let iconName;

                      if (route.name === 'Today') {
                        iconName = 'ios-today';
                      } else if (route.name === 'Exercises') {
                        iconName = 'ios-walk';
                      } else if (route.name === 'Meals') {
                        iconName = 'ios-restaurant';
                      } else {
                        iconName = 'ios-information-circle';
                      }

                      return <Ionicons name={iconName} size={size} color={color} />;
                    },
                  })}
                >
                  <>
                    <BottomTab.Screen name="Today" >
                      {(props) => <TodayView {...props} username={this.state.username} accessToken={this.state.accessToken} 
                        revokeAccessToken={this.revokeAccessToken} activities={this.state.activities} 
                        setActivities={this.setActivities} goalDailyCalories={this.state.goalDailyCalories}
                        goalDailyProtein={this.state.goalDailyProtein} goalDailyCarbohydrates={this.state.goalDailyCarbohydrates}
                        goalDailyFat={this.state.goalDailyFat} goalDailyActivity={this.state.goalDailyActivity} setGoals={this.setGoals} 
                        meals={this.state.meals} setMeals={this.setMeals} foodList={this.state.foodList} setFoodList={this.setFoodList}/>}
                    </BottomTab.Screen>

                    <BottomTab.Screen name="Meals">
                      {(props) => <MealsView {...props} username={this.state.username} accessToken={this.state.accessToken} 
                        revokeAccessToken={this.revokeAccessToken} meals={this.state.meals} setMeals={this.setMeals}
                        foodList={this.state.foodList} setFoodList={this.setFoodList}/>}
                    </BottomTab.Screen>

                    <BottomTab.Screen name="Exercises">
                      {(props) => <ExercisesView {...props} username={this.state.username} accessToken={this.state.accessToken} 
                        revokeAccessToken={this.revokeAccessToken} activities={this.state.activities} 
                        setActivities={this.setActivities}/>}
                    </BottomTab.Screen>

                    <BottomTab.Screen name="Profile">
                      {(props) => <ProfileView {...props} username={this.state.username} accessToken={this.state.accessToken} 
                        revokeAccessToken={this.revokeAccessToken} goalDailyCalories={this.state.goalDailyCalories}
                        goalDailyProtein={this.state.goalDailyProtein} goalDailyCarbohydrates={this.state.goalDailyCarbohydrates}
                        goalDailyFat={this.state.goalDailyFat} goalDailyActivity={this.state.goalDailyActivity} setGoals={this.setGoals}/>}
                    </BottomTab.Screen>
                  </>
                </BottomTab.Navigator>
              }
            </AuthStack.Screen>  
          )}
        </AuthStack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
