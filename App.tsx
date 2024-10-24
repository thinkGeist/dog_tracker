import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Title, Button, IconButton } from 'react-native-paper';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';



// Set up the Firebase config here
const firebaseConfig = {
  apiKey: 'api-key',
  authDomain: 'project-id.firebaseapp.com',
  databaseURL: 'https://project-id.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: 'sender-id',
  appId: 'app-id',
  measurementId: 'G-measurement-id',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dogs = [
  { name: 'Buddy', location: 'Park' },
  { name: 'Max', location: 'Home' },
  { name: 'Bella', location: 'Vet' },
];

const locations = ['Park', 'Home', 'Vet', 'Beach', 'Forest', 'City'];

// Define TypeScript types
type Dog = {
  id: string;
  name: string;
  location: string;
};

type ViewState = boolean[];

export default function App() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [view, setView] = useState<ViewState>([false, false, false]);

  // Use effects are used to run "side effects" in the app
  // This is where we can fetch data, update the UI, etc.
  // We will use it to fetch the dogs data from Firebase
  useEffect(() => {
    const fetchDogs = async () => {
      const snapshot = await getDocs(collection(db, 'dogs'));
      const dogsData = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name, location: doc.data().location }));
      setDogs(dogsData);
      setView(new Array(dogsData.length).fill(false));
    };

    fetchDogs();
  }, []);

  const toggleView = (index: number) => {
    const newView = [...view];
    newView[index] = !newView[index];
    setView(newView);
  };

  // Here we should update the location of the dog in Firebase as well
  const updateLocation = async (index: number, newLocation: string) => {
    const dogId = dogs[index].id;
    await updateDoc(doc(db, 'dogs', dogId), { location: newLocation });
    const updatedDogs = [...dogs];
    updatedDogs[index].location = newLocation;
    setDogs(updatedDogs);
    toggleView(index);
  };

  return (
    <View style={styles.container}>
      {dogs.map((dog, index) => (
        <Card key={index} style={styles.card}>
          <Card.Title title={dog.name} />
          <Card.Content>
            {view[index] ? (
              <View style={styles.grid}>
                {locations.map((location) => (
                  <Button mode="contained" key={location} onPress={() => updateLocation(index, location)}>
                    {location}
                  </Button>
                ))}
              </View>
            ) : (
              <View style={styles.locationContainer}>
                <IconButton icon="map-marker" />
                <Title>{dog.location}</Title>
              </View>
            )}
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => toggleView(index)}>{!view[index] ? "Update Location" : "Cancel"}</Button>
          </Card.Actions>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    justifyContent: 'space-around',
    padding: 10,
  },
  card: {
    flex: 1,
    marginVertical: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 10,
  },
});