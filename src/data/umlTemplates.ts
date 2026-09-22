import { TopicDiagram } from '../types';
export const getUmlTemplates = (): Partial<TopicDiagram>[] => [
  {
    title: "Parking Lot System",
    type: "Class",
    creationMethod: "code",
    mermaidCode: `classDiagram
    class ParkingLot {
      -String name
      -Address address
      -ParkingRate rate
      +getNewParkingTicket() ParkingTicket
      +isFull(VehicleType) boolean
      +addParkingSpot(ParkingSpot) boolean
      +assignTicket(Vehicle) boolean
    }
    class ParkingSpot {
      -int number
      -boolean free
      -VehicleType type
      +isFree() boolean
      +assignVehicle(Vehicle) boolean
      +removeVehicle() boolean
    }
    class Vehicle {
      <<abstract>>
      -String licenseNumber
      +assignTicket(ParkingTicket)
    }
    class Car {
    }
    class Truck {
    }
    Vehicle <|-- Car
    Vehicle <|-- Truck
    ParkingLot "1" *-- "*" ParkingSpot : contains
    ParkingSpot "0..1" o-- "1" Vehicle : occupies`,
  },
  {
    title: "E-Commerce Shopping Cart",
    type: "Class",
    creationMethod: "code",
    mermaidCode: `classDiagram
    class ShoppingCart {
      -List~CartItem~ items
      -double totalPrice
      +addItem(Item)
      +removeItem(Item)
      +updateQuantity(Item, int)
      +checkout()
    }
    class CartItem {
      -String productId
      -int quantity
      -double price
    }
    class Product {
      -String id
      -String name
      -double price
      -String description
    }
    ShoppingCart "1" *-- "*" CartItem : contains
    CartItem "*" --> "1" Product : references`,
  },
  {
    title: "User Authentication Flow",
    type: "Sequence",
    creationMethod: "code",
    mermaidCode: `sequenceDiagram
    actor User
    participant Frontend
    participant AuthAPI as Auth API
    participant Database
    
    User->>Frontend: Enter credentials
    Frontend->>AuthAPI: POST /login {username, password}
    AuthAPI->>Database: Query user by username
    Database-->>AuthAPI: User record (hashed_pw, salt)
    AuthAPI->>AuthAPI: Hash password & compare
    alt Valid Credentials
        AuthAPI->>Database: Store new session/Refresh token
        AuthAPI-->>Frontend: 200 OK (JWT Token)
        Frontend-->>User: Redirect to Dashboard
    else Invalid Credentials
        AuthAPI-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error message
    end`,
  },
  {
    title: "System Architecture (C4)",
    type: "Architecture",
    creationMethod: "code",
    mermaidCode: `C4Context
      title System Context diagram for Internet Banking System
      Person(customerA, "Banking Customer A", "A customer of the bank, with personal bank accounts.")
      Person(customerB, "Banking Customer B")
      Person_Ext(customerC, "Banking Customer C", "desc")
      Enterprise_Boundary(b0, "BankBoundary0") {
        System(SystemAA, "Internet Banking System", "Allows customers to view information about their bank accounts, and make payments.")
      }
      System_Ext(SystemE, "Mainframe Banking System", "Stores all of the core banking information about customers, accounts, transactions, etc.")
      
      Rel(customerA, SystemAA, "Uses")
      Rel(SystemAA, SystemE, "Uses")
      UpdateElementStyle(customerA, $fontColor="red", $bgColor="grey", $borderColor="red")`,
  }
];
