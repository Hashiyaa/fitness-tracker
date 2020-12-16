import React from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, Dimensions } from 'react-native';
import { Modal, KeyboardAvoidingView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card } from 'react-native-elements';

class MealsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mealModalVisible: false,
      foodModalVisible: false,
      modalMode: "new",
      mealID: 0,
      mealName: "",
      date: new Date(),
      // food info
      mealCur: 0,
      foodID: 0,
      foodName: "",
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0
    }
  }

  componentDidMount() {
    fetch('https://mysqlcs639.cs.wisc.edu/meals/', {
      method: 'GET',
      headers: { 'x-access-token': this.props.accessToken }
    })
    .then(res => res.json())
    .then(res => {
      this.props.setMeals(res.meals)
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

  renderMeals() {
    // console.log(this.props.meals);
    // console.log(this.props.foodList);
    if (this.props.foodList.length < this.props.meals.length) return;
    let meals = [];
    for (let i = 0; i < this.props.meals.length; i++) {
      let meal = this.props.meals[i];
      if (typeof meal.date === "string") {
        meal.date = new Date(meal.date);
      }
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbohydrates = 0;
      let totalFat = 0;
      for (const food of this.props.foodList[i]) {
        totalCalories += parseFloat(food.calories);
        totalProtein += parseFloat(food.protein);
        totalCarbohydrates += parseFloat(food.carbohydrates);
        totalFat += parseFloat(food.fat);
      }
      meals.push(
        <Card key={i} containerStyle={styles.cardView} wrapperStyle={{paddingHorizontal: 15}}>
          <Card.Title style={{fontSize: 18}}>{meal.name}</Card.Title>
          <Card.Divider/>
          <View>
            <Text style={styles.cardText}>{"Date: " + meal.date.toLocaleString('en-US')}</Text>
            <Text style={styles.cardText}>{"Total Calories: " + totalCalories}</Text>
            <Text style={styles.cardText}>{"Total Protein: " + totalProtein}</Text>
            <Text style={styles.cardText}>{"Total Carbohydrates: " + totalCarbohydrates}</Text>
            <Text style={styles.cardText}>{"Total Fat: " + totalFat}</Text>
            <Text style={styles.cardText}>{"Foods: "}</Text>
          </View>
          <View>
            {this.renderFoods(i)}
          </View>
          <View style={styles.spaceSmall} />
          <Button 
            color="#942a21" 
            style={styles.buttonInline} 
            title="Add Food" 
            onPress={() => this.setState({ 
              foodModalVisible: true, 
              modalMode: "new",
              mealCur: i
            })} 
          />
          <View style={styles.spaceSmall} />

          <Card.Divider/>
          <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center" }}>
            <Button color="#942a21" style={styles.buttonInline} title="Edit" 
              onPress={() => this.handleEditMeal(meal)} />
            <View style={styles.spaceHorizontal} />
            <Button color="#a1635f" style={styles.buttonInline} title="Delete" 
              onPress={() => this.handleDeleteMeal(meal.id)} />
          </View>
        </Card>
      );
    }
    return meals;
  }

  renderFoods(i) {
    let foods = [];
    for (let j = 0; j < this.props.foodList[i].length; j++) {
      let food = this.props.foodList[i][j];
      foods.push(
        <Card key={j} containerStyle={styles.cardView} wrapperStyle={{paddingHorizontal: 10}}>
          <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center" }}>
            <View>
              <Text style={styles.cardText}>{food.name}</Text>
            </View>
            <TouchableOpacity onPress={() => this.handleEditFood(i, food)}>
              <Icon name="edit" size={24} style={{paddingLeft: 20}}/>
            </TouchableOpacity>
            <View style={styles.spaceHorizontal} />
            <TouchableOpacity onPress={() => this.handleDeleteFood(i, food)}>
              <Icon name="trash" size={24}/>
            </TouchableOpacity>
          </View>
        </Card>
      );
    }
    return foods;
  }

  handleSaveMeal() {
    let newFoodList = [...this.props.foodList, []];
    this.props.setFoodList(newFoodList);

    this.setState({
      mealModalVisible: !this.state.mealModalVisible
    }, () => fetch('https://mysqlcs639.cs.wisc.edu/meals/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': this.props.accessToken
        },
        body: JSON.stringify({
          name: this.state.mealName,
          date: this.state.date
        })
      })
      .then(res => {
        return fetch('https://mysqlcs639.cs.wisc.edu/meals/', {
          method: 'GET',
          headers: { 'x-access-token': this.props.accessToken }
        }
        );
      })
      .then(res => res.json())
      .then(res => {
        this.props.setMeals(res.meals);
      })
      .catch(err => {
        alert("Something went wrong! Verify you have filled out the fields correctly.");
      })
    );
  }

  handleEditMeal(meal) {
    this.setState ({
      mealModalVisible: true,
      modalMode: "edit",
      mealID: meal.id,
      mealName: meal.name,
      date: meal.date
    })
  }

  handleSaveEditMeal() {
    this.setState({
      mealModalVisible: !this.state.mealModalVisible
    });
    
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + this.state.mealID, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      },
      body: JSON.stringify({
        name: this.state.mealName,
        date: this.state.date
      })
    })
    .then(res => {
      return fetch('https://mysqlcs639.cs.wisc.edu/meals/', {
        method: 'GET',
        headers: { 'x-access-token': this.props.accessToken }
      }
      );
    })
    .then(res => res.json())
    .then(res => {
      this.props.setMeals(res.meals);
    })
    .catch(err => {
      alert("Something went wrong! Verify you have filled out the fields correctly.");
    });
  }

  handleDeleteMeal(id) {
    let newMeals = [...this.props.meals];
    let newFoodList = [...this.props.foodList];
    for (let i = 0; i < newMeals.length; i++) {
      if (newMeals[i].id === id) {
        newMeals.splice(i, 1);
        newFoodList.splice(i, 1);
        break;
      }
    }
    this.props.setMeals(newMeals);
    this.props.setFoodList(newFoodList);
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + id, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      }
    })
    .then(res => res.json())
    .then(res => {
      alert("Meal deleted!");
    })
    .catch(err => {
      alert("Something went wrong! Verify you have filled out the fields correctly.");
    });
  }

  handleSaveFood() {
    this.setState({
      foodModalVisible: !this.state.foodModalVisible,
      calories: parseFloat(this.state.calories),
      protein: parseFloat(this.state.protein),
      carbohydrates: parseFloat(this.state.carbohydrates),
      fat: parseFloat(this.state.fat)
    });

    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + this.props.meals[this.state.mealCur].id + '/foods/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      },
      body: JSON.stringify({
        name: this.state.foodName,
        calories: this.state.calories,
        protein: this.state.protein,
        carbohydrates: this.state.carbohydrates,
        fat: this.state.fat
      })
    })
    .then(res => {
      return fetch('https://mysqlcs639.cs.wisc.edu/meals/' + this.props.meals[this.state.mealCur].id + '/foods/', {
          method: 'GET',
          headers: { 'x-access-token': this.props.accessToken }
        }
      );
    })
    .then(res => res.json())
    .then(res => {
      let foodList = [...this.props.foodList];
      foodList[this.state.mealCur] = res.foods;
      this.props.setFoodList(foodList);
    })
    .catch(err => {
      alert("Something went wrong! Verify you have filled out the fields correctly.");
    });
  }

  handleEditFood(i, food) {
    this.setState ({
      foodModalVisible: true,
      modalMode: "edit",
      mealCur: i,
      foodID: food.id,
      foodName: food.name,
      calories: food.calories,
      protein: food.protein,
      carbohydrates: food.carbohydrates,
      fat: food.fat
    })
  }

  handleSaveEditFood() {
    this.setState({
      foodModalVisible: !this.state.foodModalVisible
    });
    let newFoodList = [...this.props.foodList];
    for (let j = 0; j < newFoodList[this.state.mealCur].length; j++) {
      if (newFoodList[this.state.mealCur][j].id === this.state.foodID) {
        newFoodList[this.state.mealCur][j].name = this.state.foodName;
        newFoodList[this.state.mealCur][j].calories = this.state.calories;
        newFoodList[this.state.mealCur][j].protein = this.state.protein;
        newFoodList[this.state.mealCur][j].carbohydrates = this.state.carbohydrates;
        newFoodList[this.state.mealCur][j].fat = this.state.fat;
        break;
      }
    }
    this.props.setFoodList(newFoodList);
    
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + this.props.meals[this.state.mealCur].id + "/foods/" + this.state.foodID, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      },
      body: JSON.stringify({
        name: this.state.foodName,
        calories: this.state.calories,
        protein: this.state.protein,
        carbohydrates: this.state.carbohydrates,
        fat: this.state.fat
      })
    })
    .catch(err => {
      alert("Something went wrong! Verify you have filled out the fields correctly.");
    });
  }

  handleDeleteFood(i, food) {
    let newFoodList = [...this.props.foodList];
    for (let j = 0; j < newFoodList[i].length; j++) {
      if (newFoodList[i][j].id === food.id) {
        newFoodList[i].splice(j, 1);
        break;
      }
    }
    this.props.setFoodList(newFoodList);
    fetch('https://mysqlcs639.cs.wisc.edu/meals/' + this.props.meals[i].id + "/foods/" + food.id, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      }
    })
    .then(res => res.json())
    .then(res => {
      alert("Food deleted!");
    })
    .catch(err => {
      alert("Something went wrong! Verify you have filled out the fields correctly.");
    });
  }

  render() {
    return (
      <ScrollView style={styles.mainContainer} contentContainerStyle={{ flexGrow: 11, justifyContent: 'start', alignItems: "center" }}>
        <View style={styles.space} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Icon name="bread-slice" size={40} color="#900" style={{ marginRight: 20 }} />
          <Text style={styles.bigText}>Meals</Text>
        </View>
        <View style={styles.spaceSmall}></View>
        <Text>Let's get some healthy food!</Text>
        <Text>Record your meals below.</Text>
        <View style={styles.spaceSmall} />

        <View>
          {this.renderMeals()}
        </View>
        <View style={styles.spaceSmall} />

        <Button 
          color="#942a21" 
          style={styles.buttonInline} 
          title="Add Meal" 
          onPress={() => this.setState({ 
            mealModalVisible: true, 
            modalMode: "new" 
          })} 
        />
        <View style={styles.space} />

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.mealModalVisible}
        >
          <KeyboardAvoidingView behavior="padding" style={styles.centeredView}>
            <ScrollView>
              <View flex={1} flexGrow={1} onStartShouldSetResponder={() => true} style={styles.modalView}>
                <Text style={{ fontSize: 24, fontWeight: "700" }}>Meal Details</Text>
                <View style={styles.space}></View>

                <View>
                  <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Meal Name</Text>
                </View>
                <TextInput style={styles.input}
                  placeholder="Breakfast"
                  placeholderTextColor="#d9bebd"
                  onChangeText={(mealName) => this.setState({ mealName: mealName })}
                  value={this.state.mealName}
                  autoCapitalize="none" />
                <View style={styles.spaceSmall}></View>

                <View>
                  <DateTimePicker
                    testID="dataTimePicker"
                    value={this.state.date}
                    mode="datetime"
                    is24Hour={true}
                    display="default"
                    onChange={(event, date) => {
                      this.setState({date: date});
                    }}
                    style={{width: Dimensions.get("window").width}}
                  />
                </View>
                <View style={styles.spaceSmall}></View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Button color="#942a21" style={styles.buttonInline} title="Save Meal" 
                    onPress={this.state.modalMode === "new" ? (() => this.handleSaveMeal()) : 
                    (() => this.handleSaveEditMeal())} />
                  <View style={styles.spaceHorizontal} />
                  <Button color="#a1635f" style={styles.buttonInline} title="Exit" 
                    onPress={() => this.setState({mealModalVisible: !this.state.mealModalVisible})} />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.foodModalVisible}
        >
          <KeyboardAvoidingView behavior="padding" style={styles.centeredView}>
            <ScrollView>
              <View flex={1} flexGrow={1} onStartShouldSetResponder={() => true} style={styles.modalView}>
                <Text style={{ fontSize: 24, fontWeight: "700" }}>Food Details</Text>
                <View style={styles.space}></View>

                <View>
                  <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Food Name</Text>
                </View>
                <TextInput style={styles.input}
                  placeholder="Bread"
                  placeholderTextColor="#d9bebd"
                  onChangeText={(foodName) => this.setState({ foodName: foodName })}
                  value={this.state.foodName}
                  autoCapitalize="none" />
                <View style={styles.spaceSmall}></View>

                <View>
                  <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Calories</Text>
                </View>
                <TextInput style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#d9bebd"
                  onChangeText={(calories) => this.setState({ calories: calories })}
                  value={this.state.calories + ""}
                  autoCapitalize="none" />
                <View style={styles.spaceSmall}></View>

                <View>
                  <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Protein</Text>
                </View>
                <TextInput style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#d9bebd"
                  onChangeText={(protein) => this.setState({ protein: protein })}
                  value={this.state.protein + ""}
                  autoCapitalize="none" />
                <View style={styles.spaceSmall}></View>

                <View>
                  <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Carbohydrates</Text>
                </View>
                <TextInput style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#d9bebd"
                  onChangeText={(carbohydrates) => this.setState({ carbohydrates: carbohydrates })}
                  value={this.state.carbohydrates + ""}
                  autoCapitalize="none" />
                <View style={styles.spaceSmall}></View>

                <View>
                  <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Fat</Text>
                </View>
                <TextInput style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#d9bebd"
                  onChangeText={(fat) => this.setState({ fat: fat })}
                  value={this.state.fat + ""}
                  autoCapitalize="none" />
                <View style={styles.spaceSmall}></View>

                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  <Button color="#942a21" style={styles.buttonInline} title="Save Food" 
                    onPress={this.state.modalMode === "new" ? (() => this.handleSaveFood()) : 
                    (() => this.handleSaveEditFood())} />
                  <View style={styles.spaceHorizontal} />
                  <Button color="#a1635f" style={styles.buttonInline} title="Exit" 
                    onPress={() => this.setState({foodModalVisible: !this.state.foodModalVisible})} />
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
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
    marginBottom: 40,
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

export default MealsView;