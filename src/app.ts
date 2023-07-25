// const names: Array<string> = []; //same as string[]
//* by saying the array will be of strings you have access to string methods even though the array is empty and will throw a runtime error
// names[0].split(" ");

// //? generic types help build stronger type safety
// const promise: Promise<string> = new Promise((resolve, reject) => {
//   setTimeout(() => {
//     resolve("This is done");
//   }, 2000);
// });

// promise.then((data) => {
//   data.split(" ");
// });

//* the <T> is a generic type signifier. It's a booger but <T> is convention
//* when you add more parameters just continue alphabetically to U, V, etc
//! adding 'extends {}' after T was something that I had to do to avoid errors, the Udemy instructor did not have them
//! why it worked after just adding it after T was that Object.assign() only requires an object for the first argument, subsequent args can be null or undefined, they just need to be an object to get the desired result
//! this was solved by going to tsconfig and turning "strictNullChecks": false
//? constraints
//* adding extends object to both T and U ensures that they must be of type object to compile correctly
//* you can use all sorts of constraints to allow for flexibility in your generics, like Union types or custom types
//? function merge<T extends string | number, U extends Person>(objA: T, objB: U) {
//* takeaways: we assign two generics to the function because we expect exactly 2 arguments but don't care what they are
//* we say they both extend objects because while we don't care exactly what they are, they must be objects
//* we set the type of each argument to the generics
//* the compiler will now yell unless the function is supplied exactly two args that are both objects
function merge<T extends object, U extends object>(objA: T, objB: U) {
  return Object.assign(objA, objB);
}

//* mergedObj3 will fail silently (not work but no errors) because 34 is not an object and thus Object.assign() can't use it
//* adding the constraint to the function definition caused it to fail predictably
// const mergedObj3 = merge({ name: "Geo" }, 34);
const mergedObj = merge({ name: "Geo" }, { age: 34 });
const mergedObj2 = merge({ name: "Geo", hobbies: ["Sports"] }, { age: 34 });
// console.log(mergedObj3);

//? another example
//* a common pattern in generic functions is to have your passed in property be of the same generic type, T here
//* doesn't have to be, but is a common pattern

//* creating an interface that guarantees that we have an object with a length property
interface Lengthy {
  length: number;
}

//* adding 'extends Lengthy' ensures that whatever we pass into the function must have a length property, ie an array or string
//* to be more precise we add a return type to the end with a tuple expecting exactly 2 elements
//* takeaways: We assign the generic T because we don't really care what exactly the function takes in
//* we create and extend the Lengthy interface because even though we don't care what the function takes in, it must have a length because that is what our function leverages
function countAndDescribe<T extends Lengthy>(element: T): [T, string] {
  let descriptionText = "Contains no elements.";
  if (element.length === 1) {
    descriptionText = "Contains one element.";
  } else if (element.length > 1) {
    descriptionText = "Contains " + element.length + " elements.";
  }
  return [element, descriptionText];
}

console.log(countAndDescribe("s"));

//? the keyof constraint
//* we tell TS that T has to be an object, and U has to be a key of the T object
function extractAndConvert<T extends object, U extends keyof T>(obj: T, key: U) {
  return "Value: " + obj[key];
}

//* here TS gets mad because even though an object is passed as the first argument, it doesn't have a name key
// extractAndConvert({}, "name");
//* similarly this will not work because the object doesn't have an age property
// extractAndConvert({ name: "Geo" }, "age");
extractAndConvert({ name: "Geo" }, "name");

//? generic classes
//* takeaway: we create a flexible but still type safe class
//* things get weird with generics and primitives vs non-primitives, might be better to just make two classes
//* here we add a generic type to the class and method args so they only accept like data types
class DataStorage<T extends string | number | boolean> {
  private data: T[] = [];

  addItem(item: T) {
    this.data.push(item);
  }

  removeItem(item: T) {
    //* this starts failing when working with non-primitives, ie objects and arrays
    //* with objects and arrays this will always return -1 and remove the last item in the array, could result in false positives
    if (this.data.indexOf(item) === -1) {
      return;
    }
    this.data.splice(this.data.indexOf(item), 1);
  }

  getItems() {
    return [...this.data];
  }
}

//* by adding a string generic function type we declare the the function will only receive and return strings
const textStorage = new DataStorage<string>();
//* since it will only receive and return strings, it throws an error if you try to pass in a number
// textStorage.addItem(10)

textStorage.addItem("Geo");
textStorage.addItem("Kallyn");
textStorage.removeItem("Geo");
console.log(textStorage);

//* in the same way, if you tell it to only accept numbers it will yell at strings
const numberStorage = new DataStorage<number>();
// numberStorage.addItem('Geo')

//* but building a generic class allows a lot of flexibility while maintaining firm control of the class
const mixedStorage = new DataStorage<string | number>();

//* things get wonky when using non-primitives. **The class was modified to only accept primitives so everything below no longer works**
// const objStorage = new DataStorage<object>();

//? using objects in this way does not work because the added and removed Kallyn objects are two different objects in memory
// objStorage.addItem({ name: "Geo" });
// objStorage.addItem({ name: "Kallyn" });
// objStorage.removeItem({ name: "Kallyn" });

//? you need to store the objects in a variable so that you are adding and removing the reference to the object
// const geoObj = { name: "Geo" };
// const kallynObj = { name: "Kallyn" };

// objStorage.addItem(geoObj);
// objStorage.addItem(kallynObj);
// objStorage.removeItem(geoObj);
// console.log(objStorage.getItems());

//? generic utility types

//? Partial utility type
//*lets you temporarily set the properties of an interface to optional
interface CourseGoal {
  title: string;
  description: string;
  completeUntil: Date;
}

function createCourseGoal(title: string, description: string, date: Date): CourseGoal {
  //* using the Partial utility type tells TS that yes eventually we want a CourseGoal type object, but for now it's ok to have part of one
  //* under the hood it's still looking for all of the CourseGoal properties, but they are set to optional so that they don't have to all be added at once, and we can initialize with an empty object
  let courseGoal: Partial<CourseGoal> = {};
  courseGoal.title = title;
  courseGoal.description = description;
  courseGoal.completeUntil = date;
  //* the return is now broken though because we are returning type Partial<CourseGoal>
  // return courseGoal;
  //* so we fix it by typecasting at the end for the final check
  return courseGoal as CourseGoal;
}

//?Readonly utility type
//*exactly what is says on the tin, sets the defined as readonly and won't allow any methods that mutate it
const names: Readonly<string[]> = ["Geo", "Kallyn"];
// names.push("Meister");
// names.pop()
