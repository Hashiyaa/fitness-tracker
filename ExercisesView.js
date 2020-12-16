import React from 'react';
import { StyleSheet, Text, View, Button, TextInput, ScrollView, Dimensions } from 'react-native';
import { Modal, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Card } from 'react-native-elements';

class ExercisesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalMode: "new",
      id: 0,
      exerciseName: "",
      duration: 0,
      date: new Date(),
      calories: 0
    }
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
  }

  renderExercises() {
    let exercises = [];
    for (const exercise of this.props.activities) {
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
          <View style={styles.spaceSmall}></View>
          <View style={{ flexDirection: 'row', justifyContent: "center", alignItems: "center" }}>
            <Button color="#942a21" style={styles.buttonInline} title="Edit" 
              onPress={() => this.handleEditExercise(exercise)} />
            <View style={styles.spaceHorizontal} />
            <Button color="#a1635f" style={styles.buttonInline} title="Delete" 
              onPress={() => this.handleDeleteExercise(exercise.id)} />
          </View>
        </Card>
      );
    }
    return exercises;
  }

  handleSaveExercise() {
    this.setState({
      modalVisible: !this.state.modalVisible,
      duration: parseFloat(this.state.duration),
      calories: parseFloat(this.state.calories)
    }, () => fetch('https://mysqlcs639.cs.wisc.edu/activities/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-access-token': this.props.accessToken
        },
        body: JSON.stringify({
          name: this.state.exerciseName,
          duration: this.state.duration,
          date: this.state.date,
          calories: this.state.calories
        })
      })
      .then(res => {
        return fetch('https://mysqlcs639.cs.wisc.edu/activities/', {
          method: 'GET',
          headers: { 'x-access-token': this.props.accessToken }
        }
        );
      })
      .then(res => res.json())
      .then(res => {
        this.props.setActivities(res.activities);
      })
      .catch(err => {
        alert("Something went wrong! Verify you have filled out the fields correctly.");
      })
    );
  }

  handleEditExercise(exercise) {
    this.setState ({
      modalVisible: true,
      modalMode: "edit",
      id: exercise.id,
      exerciseName: exercise.name,
      duration: exercise.duration,
      date: exercise.date,
      calories: exercise.calories
    })
  }

  handleSaveEditExercise() {
    this.setState({
      modalVisible: !this.state.modalVisible,
      duration: parseFloat(this.state.duration),
      calories: parseFloat(this.state.calories)
    });

    fetch('https://mysqlcs639.cs.wisc.edu/activities/' + this.state.id, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      },
      body: JSON.stringify({
        name: this.state.exerciseName,
        duration: this.state.duration,
        date: this.state.date,
        calories: this.state.calories
      })
    })
    .then(res => {
      return fetch('https://mysqlcs639.cs.wisc.edu/activities/', {
          method: 'GET',
          headers: { 'x-access-token': this.props.accessToken }
        }
      );
    })
    .then(res => res.json())
    .then(res => {
      this.props.setActivities(res.activities);
    })
    .catch(err => {
      alert("Something went wrong! Verify you have filled out the fields correctly.");
    });
  }

  handleDeleteExercise(id) {
    fetch('https://mysqlcs639.cs.wisc.edu/activities/' + id, {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'x-access-token': this.props.accessToken
      }
    })
    .then(res => {
      return fetch('https://mysqlcs639.cs.wisc.edu/activities/', {
          method: 'GET',
          headers: { 'x-access-token': this.props.accessToken }
        }
      );
    })
    .then(res => res.json())
    .then(res => {
      this.props.setActivities(res.activities);
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
          <Icon name="running" size={40} color="#900" style={{ marginRight: 20 }} />
          <Text style={styles.bigText}>Exercises</Text>
        </View>
        <View style={styles.spaceSmall}></View>
        <Text>Let's get to work!</Text>
        <Text>Record your exercises below.</Text>
        <View style={styles.spaceSmall} />

        <View>
          {this.renderExercises()}
        </View>
        <View style={styles.spaceSmall} />

        <Button 
          color="#942a21" 
          style={styles.buttonInline} 
          title="Add Exercise" 
          onPress={() => this.setState({ 
            modalVisible: true, 
            modalMode: "new" 
          })} 
        />
        <View style={styles.space} />

        <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <KeyboardAvoidingView behavior="padding" style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={{ fontSize: 24, fontWeight: "700" }}>Exercise Details</Text>
              <View style={styles.space}></View>

              <View>
                <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Exercise Name</Text>
              </View>
              <TextInput style={styles.input}
                placeholder="Run"
                placeholderTextColor="#d9bebd"
                onChangeText={(exerciseName) => this.setState({ exerciseName: exerciseName })}
                value={this.state.exerciseName}
                autoCapitalize="none" />
              <View style={styles.spaceSmall}></View>

              <View>
                <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Duration (minutes)</Text>
              </View>
              <TextInput style={styles.input}
                placeholder="0"
                placeholderTextColor="#d9bebd"
                onChangeText={(duration) => this.setState({ duration: duration })}
                value={this.state.duration + ""}
                autoCapitalize="none" />
              <View style={styles.spaceSmall}></View>

              <View>
                <Text style={{ textAlignVertical: "center", fontWeight: "700" }}>Calories Burnt</Text>
              </View>
              <TextInput style={styles.input}
                placeholder="0"
                placeholderTextColor="#d9bebd"
                onChangeText={(calories) => this.setState({ calories: calories })}
                value={this.state.calories + ""}
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
                <Button color="#942a21" style={styles.buttonInline} title="Save Exercise" 
                  onPress={this.state.modalMode === "new" ? (() => this.handleSaveExercise()) : 
                  (() => this.handleSaveEditExercise())} />
                <View style={styles.spaceHorizontal} />
                <Button color="#a1635f" style={styles.buttonInline} title="Exit" 
                  onPress={() => this.setState({modalVisible: !this.state.modalVisible})} />
              </View>
            </View>
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

export default ExercisesView;