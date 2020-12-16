import React from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, Dimensions } from 'react-native';
import { Modal, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card } from 'react-native-elements';

class TodayView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    fetch('https://mysqlcs639.cs.wisc.edu/activities/', {
      method: 'GET',
      headers: { 'x-access-token': this.props.accessToken }
    })
    .then(res => res.json())
    .then(res => {
      this.props.setActivities(res.activities);
    });

    fetch('https://mysqlcs639.cs.wisc.edu/users/' + this.props.username, {
      method: 'GET',
      headers: { 'x-access-token': this.props.accessToken }
    })
    .then(res => res.json())
    .then(res => {
      this.props.setGoals({
        calories: res.goalDailyCalories,
        protein: res.goalDailyProtein,
        carbohydrates: res.goalDailyCarbohydrates,
        fat: res.goalDailyFat,
        activity: res.goalDailyActivity
      }, "all");
    });

    fetch('https://mysqlcs639.cs.wisc.edu/meals/', {
      method: 'GET',
      headers: { 'x-access-token': this.props.accessToken }
    })
    .then(res => res.json())
    .then(res => {
      this.props.setMeals(res.meals);
      let promises = [];
      for (const meal of res.meals) {
        promises.push(fetch('https://mysqlcs639.cs.wisc.edu/meals/' + meal.id + '/foods/', {
          method: 'GET',
          headers: { 'x-access-token': this.props.accessToken }
        }));
      };
      return Promise.all(promises);
    })
    .then(data => {
      let promises = [];
      for (const res of data) {
        promises.push(res.json());
      }
      return Promise.all(promises);
    })
    .then(data => {
      let foodList = [];
      for (const res of data) {
        foodList.push(res.foods);
      }
      this.props.setFoodList(foodList);
    });
  }

  getTodayActivities() {
    let today = new Date();
    let todayActivities = [];
    for (let i = 0; i < this.props.activities.length; i++) {
      let date = this.props.activities[i].date
      if (typeof this.props.activities[i].date === "string") {
        date = new Date(this.props.activities[i].date);
      }
      if (date.toLocaleDateString() === today.toLocaleDateString()) {
        todayActivities.push(i);
      }
    }
    return todayActivities;
  }

  getTodayMeals() {
    let today = new Date();
    let todayMeals = [];
    for (let i = 0; i < this.props.meals.length; i++) {
      let date = this.props.meals[i].date
      if (typeof this.props.meals[i].date === "string") {
        date = new Date(this.props.meals[i].date);
      }
      if (date.toLocaleDateString() === today.toLocaleDateString()) {
        todayMeals.push(i);
      }
    }
    return todayMeals;
  }

  getTotalActivityTime() {
    let todayActivities = this.getTodayActivities();
    let sum = 0;
    for (const index of todayActivities) {
      sum += parseFloat(this.props.activities[index].duration);
    }
    return sum;
  }

  getTotalNutrients(type) {
    if (this.props.foodList.length < this.props.meals.length) return 0;
    let todayMeals = this.getTodayMeals();
    let sum = 0;
    for (const index of todayMeals) {
      let foods = this.props.foodList[index];
      for (const food of foods) {
        if (type === "calories") {
          sum += parseFloat(food.calories);
        } else if (type === "protein") {
          sum += parseFloat(food.protein);
        } else if (type === "carbohydrates") {
          sum += parseFloat(food.carbohydrates);
        } else if (type === "fat") {
          sum += parseFloat(food.fat);
        }
      }
    }
    return sum;
  }

  renderExercises() {
    let todayActivities = this.getTodayActivities();
    let exercises = [];
    for (const index of todayActivities) {
      let exercise = this.props.activities[index];
      if (typeof exercise.date === "string") {
        exercise.date = new Date(exercise.date);
      }
      exercises.push(
        <Card key={exercise.id} containerStyle={styles.cardView} wrapperStyle={{paddingHorizontal: 15}}>
          <Card.Title style={{fontSize: 18}}>{exercise.name}</Card.Title>
          <Card.Divider/>
          <View>
            <Text style={styles.cardText}>{"Date: " + exercise.date.toLocaleString('en-US')}</Text>
            <Text style={styles.cardText}>{"Calories Burnt: " + exercise.calories}</Text>
            <Text style={styles.cardText}>{"Duration: " + exercise.duration + " Minutes"}</Text>
          </View>
        </Card>
      );
    }
    return exercises;
  }

  renderMeals() {
    if (this.props.foodList.length < this.props.meals.length) return;
    let todayMeals = this.getTodayMeals();
    let meals = [];
    for (const index of todayMeals) {
      let meal = this.props.meals[index];
      if (typeof meal.date === "string") {
        meal.date = new Date(meal.date);
      }
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbohydrates = 0;
      let totalFat = 0;
      for (const food of this.props.foodList[index]) {
        totalCalories += parseFloat(food.calories);
        totalProtein += parseFloat(food.protein);
        totalCarbohydrates += parseFloat(food.carbohydrates);
        totalFat += parseFloat(food.fat);
      }
      meals.push(
        <Card key={index} containerStyle={styles.cardView} wrapperStyle={{paddingHorizontal: 15}}>
          <Card.Title style={{fontSize: 18}}>{meal.name}</Card.Title>
          <Card.Divider/>
          <View>
            <Text style={styles.cardText}>{"Date: " + meal.date.toLocaleString('en-US')}</Text>
            <Text style={styles.cardText}>{"Total Calories: " + totalCalories}</Text>
            <Text style={styles.cardText}>{"Total Protein: " + totalProtein}</Text>
            <Text style={styles.cardText}>{"Total Carbohydrates: " + totalCarbohydrates}</Text>
            <Text style={styles.cardText}>{"Total Fat: " + totalFat}</Text>
            <Text style={styles.cardText}>{"Foods: " + this.renderFoods(index)}</Text>
          </View>
        </Card>
      );
    }
    return meals;
  }

  renderFoods(i) {
    let foods = "";
    for (let j = 0; j < this.props.foodList[i].length; j++) {
      let food = this.props.foodList[i][j];
      if (j > 0) foods += ", "
      foods += food.name;
    }
    return foods;
  }

  render() {
    return (
      <ScrollView style={styles.mainContainer} contentContainerStyle={{ flexGrow: 11, justifyContent: 'start', alignItems: "center" }}>
        <View style={styles.space} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Icon name="calendar-day" size={40} color="#900" style={{ marginRight: 20}} accessible={false}/>
          <Text style={styles.bigText}>Today</Text>
        </View>
        <View style={styles.spaceSmall}></View>
        <Text>What's on the agenda for today?</Text>
        <Text>Below are all of your goals and exercises</Text>
        <View style={styles.spaceSmall} />

        <Card key="goal" containerStyle={styles.cardView} wrapperStyle={{paddingHorizontal: 15}}>
          <Card.Title style={{fontSize: 18}}>Goals Status</Card.Title>
          <Card.Divider/>
          <View>
            <Text style={styles.cardText}>{
              "Daily Activities: " + this.getTotalActivityTime() + "/" + this.props.goalDailyActivity + " minutes"
            }</Text>
            <Text style={styles.cardText}>{
              "Daily Calories: " + this.getTotalNutrients("calories") + "/" + this.props.goalDailyCalories
            }</Text>
            <Text style={styles.cardText}>{
              "Daily Protein: " + this.getTotalNutrients("protein") + "/" + this.props.goalDailyProtein
            }</Text>
            <Text style={styles.cardText}>{
              "Daily Carbohydrates: " + this.getTotalNutrients("carbohydrates") + "/" + this.props.goalDailyCarbohydrates
            }</Text>
            <Text style={styles.cardText}>{
              "Daily Fat: " + this.getTotalNutrients("fat") + "/" + this.props.goalDailyFat
            }</Text>
          </View>
        </Card>
        <View style={styles.space} />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Icon name="running" size={24} color="#900" style={{ marginRight: 20 }} accessible={false}/>
          <Text style={{fontSize: 20}}>Exercises</Text>
        </View>

        <View>
          {this.renderExercises()}
        </View>
        <View style={styles.space} />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Icon name="bread-slice" size={24} color="#900" style={{ marginRight: 20 }} accessible={false}/>
          <Text style={{fontSize: 20}}>Meals</Text>
        </View>

        <View>
          {this.renderMeals()}
        </View>
        <View style={styles.space} />
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  scrollView: {
    height: Dimensions.get('window').height
  },
  mainContainer: {
    flex: 1
  },
  scrollViewContainer: {},
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bigText: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 5
  },
  spaceSmall: {
    width: 20,
    height: 15,
  },
  space: {
    width: 20,
    height: 30,
  },
  spaceHorizontal: {
    display: "flex",
    width: 20
  },
  buttonInline: {
    display: "flex"
  },
  input: {
    width: 200,
    padding: 10,
    margin: 5,
    height: 40,
    borderColor: '#c9392c',
    borderWidth: 1
  },
  inputInline: {
    flexDirection: "row",
    display: "flex",
    width: 200,
    padding: 10,
    margin: 5,
    height: 40,
    borderColor: '#c9392c',
    borderWidth: 1
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3
  },
  cardView: {
    borderRadius: 20
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24
  }
});

export default TodayView;