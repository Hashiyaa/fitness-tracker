import React from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Dimensions } from 'react-native';

class ProfileView extends React.Component {

  /**
   * Specifies the default values that will be shown for a split second
   * while data is loading in from the server.
   */
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
    }
  }

  /**
   * Fetch the data from the API after mounting; this may take a few seconds.
   * Once the data is fetched, it is stored into the state and then displayed
   * onto the fields.
   * 
   * This GET request requires us to specify our username and x-access-token,
   * both of which we inherit through props.
   */
  componentDidMount() {
    fetch('https://mysqlcs639.cs.wisc.edu/users/' + this.props.username, {
      method: 'GET',
      headers: { 'x-access-token': this.props.accessToken }
    })
    .then(res => res.json())
    .then(res => {
      this.setState({
        firstName: res.firstName,
        lastName: res.lastName
      });
      this.props.setGoals({
        calories: res.goalDailyCalories,
        protein: res.goalDailyProtein,
        carbohydrates: res.goalDailyCarbohydrates,
        fat: res.goalDailyFat,
        activity: res.goalDailyActivity
      }, "all");
    });
  }

  /**
   * Make a PUT request to save all the entered information onto the server.
   * Note, we must check if what the user entered is a number. Once the state
   * is guarnteed to be set, we call the fetch function.
   * 
   * This PUT request requires us to specify our username and x-access-token,
   * both of which we inherit through props. Additionally, we are sending a
   * JSON body, so we need to specify Content-Type: application/json
   */
  handleSaveProfile() {
    this.props.setGoals({
      calories: parseFloat(this.props.goalDailyCalories),
      protein: parseFloat(this.props.goalDailyProtein),
      carbohydrates: parseFloat(this.props.goalDailyCarbohydrates),
      fat: parseFloat(this.props.goalDailyFat),
      activity: parseFloat(this.props.goalDailyActivity)
    }, "all");

    fetch('https://mysqlcs639.cs.wisc.edu/users/' + this.props.username, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      },
      body: JSON.stringify({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        goalDailyCalories: this.props.goalDailyCalories,
        goalDailyProtein: this.props.goalDailyProtein,
        goalDailyCarbohydrates: this.props.goalDailyCarbohydrates,
        goalDailyFat: this.props.goalDailyFat,
        goalDailyActivity: this.props.goalDailyActivity
      })
    })
    .then(res => res.json())
    .then(res => {
      alert("Your profile has been updated!");
    })
    .catch(err => {
      alert("Something went wrong! Verify you have filled out the fields correctly.");
    })
  }

  backToLogin() {
    this.props.revokeAccessToken();
  }

  /**
   * Displays and collects the profile information.
   * 
   * The styling could definitely be cleaned up; should be consistent!
   */
  render() {
    return (
      <KeyboardAvoidingView behavior="position">
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: "center" }}>
          <View style={styles.space} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Icon name="male" size={40} color="#900" style={{ marginRight: 20 }} accessible={false}/>
            <Text style={styles.bigText}>About Me</Text>
          </View>
          <View style={styles.spaceSmall}></View>
          <Text>Let's get to know you!</Text>
          <Text>Specify your information below.</Text>
          <View style={styles.space} />

          <Text style={{ textAlignVertical: "center", fontWeight: "700", fontSize: 20 }}>Personal Information</Text>
          <View style={styles.spaceSmall}></View>
          <View accessible={true} accessibilityLabel={"First name. " + this.state.firstName + ". Double tap to edit"}
            style={{alignItems: "center"}}>
            <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>First Name</Text>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="Bucky"
              placeholderTextColor="#d9bebd"
              onChangeText={(firstName) => this.setState({ firstName: firstName })}
              value={this.state.firstName}
              autoCapitalize="none" />
          </View>
          <View style={styles.spaceSmall}></View>

          <View accessible={true} accessibilityLabel={"Last name. " + this.state.lastName + ". Double tap to edit"}
            style={{alignItems: "center"}}>
            <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Last Name</Text>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="Badger"
              placeholderTextColor="#d9bebd"
              onChangeText={(lastName) => this.setState({ lastName: lastName })}
              value={this.state.lastName}
              autoCapitalize="none" />
          </View>
          <View style={styles.spaceSmall}></View>

          <Text style={{ textAlignVertical: "center", fontWeight: "700", fontSize: 20 }}>Fitness Goals</Text>
          <View style={styles.spaceSmall}></View>
          <View accessible={true} accessibilityLabel={"Daily calories. " + this.props.goalDailyCalories + ". Double tap to edit"}
            style={{alignItems: "center"}}>
            <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Daily Calories (kcal)</Text>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="2200"
              placeholderTextColor="#d9bebd"
              onChangeText={(goalDailyCalories) => this.props.setGoals(goalDailyCalories, "calories")}
              value={this.props.goalDailyCalories + ""}
              autoCapitalize="none" />
          </View>
          <View style={styles.spaceSmall}></View>

          <View accessible={true} accessibilityLabel={"Daily protein. " + this.props.goalDailyProtein + ". Double tap to edit"}
            style={{alignItems: "center"}}>
            <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Daily Protein (grams)</Text>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="52"
              placeholderTextColor="#d9bebd"
              onChangeText={(goalDailyProtein) => this.props.setGoals(goalDailyProtein, "protein")}
              value={this.props.goalDailyProtein + ""}
              autoCapitalize="none" />
          </View>
          <View style={styles.spaceSmall}></View>

          <View accessible={true} accessibilityLabel={"Daily carbohydrates. " + this.props.goalDailyCarbohydrates + ". Double tap to edit"}
            style={{alignItems: "center"}}>
            <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Daily Carbs (grams)</Text>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="130"
              placeholderTextColor="#d9bebd"
              onChangeText={(goalDailyCarbohydrates) => this.props.setGoals(goalDailyCarbohydrates, "carbohydrates")}
              value={this.props.goalDailyCarbohydrates + ""}
              autoCapitalize="none" />
          </View>
          <View style={styles.spaceSmall}></View>

          <View accessible={true} accessibilityLabel={"Daily fat. " + this.props.goalDailyFat + ". Double tap to edit"}
            style={{alignItems: "center"}}>
            <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Daily Fat (grams)</Text>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="35"
              placeholderTextColor="#d9bebd"
              onChangeText={(goalDailyFat) => this.props.setGoals(goalDailyFat, "fat")}
              value={this.props.goalDailyFat + ""}
              autoCapitalize="none" />
          </View>
          <View style={styles.spaceSmall}></View>

          <View accessible={true} accessibilityLabel={"Daily activities. " + this.props.goalDailyActivity + ". Double tap to edit"}
            style={{alignItems: "center"}}>
            <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Daily Activity (mins)</Text>
            <TextInput style={styles.input}
              underlineColorAndroid="transparent"
              placeholder="60"
              placeholderTextColor="#d9bebd"
              onChangeText={(goalDailyActivity) => this.props.setGoals(goalDailyActivity, "activity")}
              value={this.props.goalDailyActivity + ""}
              autoCapitalize="none" />
          </View>
          <View style={styles.spaceSmall}></View>

          <View style={styles.space} />

          <Text style={{ fontWeight: "700", fontSize: 20 }}>Looks good! All set?</Text>
          <View style={styles.spaceSmall} />

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Button color="#942a21" style={styles.buttonInline} title="Save Profile" onPress={() => this.handleSaveProfile()} />
            <View style={styles.spaceHorizontal} />
            <Button color="#a1635f" style={styles.buttonInline} title="Exit" onPress={() => this.backToLogin()} />
          </View>
          <View style={styles.space} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
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
  }
});

export default ProfileView;
