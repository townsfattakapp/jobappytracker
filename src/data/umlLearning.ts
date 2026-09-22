export interface UmlTutorial {
  id: string;
  title: string;
  diagramType: string;
  sections: {
    title: string;
    content: string;
    mermaidExample?: string;
  }[];
}

export const umlTutorials: UmlTutorial[] = [
  {
    id: "class-diagram",
    title: "Class Diagram Learning Path",
    diagramType: "Class",
    sections: [
      {
        title: "1. What is a class diagram?",
        content: "A class diagram is a static structural diagram that describes the structure of a system by showing the system's classes, their attributes, operations (or methods), and the relationships among objects.\n\n**When to use it:** To model the static view of a system, conceptual modeling, and translating models into programming code.\n**When not to use it:** When trying to understand the dynamic behavior or flow of a system over time.",
      },
      {
        title: "2. Classes and objects",
        content: "A Class is a blueprint. An Object is an instance of a Class. In a Class Diagram, a class is represented by a rectangle with three compartments: Name, Attributes, and Methods.",
        mermaidExample: `classDiagram
    class Vehicle {
      +String make
      +String model
      +start() void
    }`
      },
      {
        title: "3. Attributes and methods",
        content: "Attributes represent the state (variables). Methods represent the behavior (functions).\n\nAttributes are usually written as `visibility name: type`.\nMethods are usually written as `visibility name(parameters): return_type`.",
      },
      {
        title: "4. Visibility modifiers",
        content: "Visibility modifiers dictate who can access an attribute or method:\n\n- `+` Public (accessible from anywhere)\n- `-` Private (accessible only within the class)\n- `#` Protected (accessible within the class and subclasses)\n- `~` Package/Internal (accessible within the same package)",
        mermaidExample: `classDiagram
    class BankAccount {
      -double balance
      #String accountNumber
      +double getBalance()
      -calculateInterest()
    }`
      },
      {
        title: "5. Association",
        content: "A general \"uses-a\" relationship between two classes. It means they are aware of each other but have their own independent lifecycles. Drawn as a solid line (optionally with an arrowhead for directional association).",
        mermaidExample: `classDiagram
    Driver --> Car : drives`
      },
      {
        title: "6. Inheritance (Generalization)",
        content: "An \"is-a\" relationship where a subclass inherits from a superclass. Drawn as a solid line with a hollow, closed arrowhead pointing to the superclass.",
        mermaidExample: `classDiagram
    Vehicle <|-- Car
    Vehicle <|-- Truck`
      },
      {
        title: "7. Interface realization",
        content: "When a class implements the methods declared in an Interface. Drawn as a dashed line with a hollow, closed arrowhead pointing to the interface.",
        mermaidExample: `classDiagram
    class Printable {
        <<interface>>
        +print()
    }
    Printable <|.. Document`
      },
      {
        title: "8. Aggregation",
        content: "A \"has-a\" relationship where the child can exist independently of the parent. (e.g., Department and Teacher). Drawn as a solid line with a hollow diamond pointing to the parent.",
        mermaidExample: `classDiagram
    Department o-- Teacher : has`
      },
      {
        title: "9. Composition",
        content: "A strong \"has-a\" relationship where the child's lifecycle is bound to the parent. If the parent is destroyed, the child is destroyed (e.g., House and Room). Drawn as a solid line with a filled diamond pointing to the parent.",
        mermaidExample: `classDiagram
    House *-- Room : contains`
      },
      {
        title: "10. Dependency",
        content: "A weaker relationship where a change in one class may force a change in another (e.g., a class uses another class as a parameter in a method). Drawn as a dashed line with an open arrowhead.",
        mermaidExample: `classDiagram
    OrderController ..> OrderService : uses`
      },
      {
        title: "11. Multiplicity",
        content: "Indicates how many instances of one class relate to one instance of another class. Common values: `1`, `0..1`, `*` (many), `1..*` (one or more).",
        mermaidExample: `classDiagram
    Customer "1" --> "*" Order : places`
      },
      {
        title: "12. Abstract classes and interfaces",
        content: "Abstract classes (cannot be instantiated) often have italicized names or use `<<abstract>>`. Interfaces use `<<interface>>`.\n\nAbstract methods are methods without a body that must be implemented by subclasses, also often italicized.",
      },
      {
        title: "13. Modeling a real application",
        content: "A practical example: A simplified Library Management System.",
        mermaidExample: `classDiagram
    class Library {
        -String name
        +addBook(Book)
    }
    class Book {
        -String ISBN
        -String title
    }
    class Member {
        -String memberId
        +borrow(Book)
    }
    Library *-- Book
    Library o-- Member
    Member "1" --> "*" Book : borrows`
      },
      {
        title: "14. Reviewing design tradeoffs",
        content: "Do not teach aggregation, composition, inheritance and dependency as interchangeable. Explain their actual semantic differences:\n\n- **Inheritance vs Composition**: Prefer composition over inheritance to reduce tight coupling. Inheritance is rigid.\n- **Aggregation vs Composition**: Use Aggregation when the child makes sense on its own. Use Composition when the child is just a piece of the parent.",
      }
    ]
  },
  {
    id: "sequence-diagram",
    title: "Sequence Diagram Learning Path",
    diagramType: "Sequence",
    sections: [
      {
        title: "1. What is a sequence diagram?",
        content: "An interaction diagram that details how operations are carried out: what messages are sent and when. Sequence diagrams are organized according to time.\n\n**When to use it:** To model the flow of logic within your system in a visual manner, typically for a single use case.\n**When not to use it:** To show the static relationships between classes."
      },
      {
        title: "2. Actors and Participants",
        content: "Actors are entities (often human) outside the system. Participants are objects or components within the system.",
        mermaidExample: `sequenceDiagram
    actor User
    participant System`
      },
      {
        title: "3. Lifelines",
        content: "A dashed vertical line extending downwards from an actor or participant indicating the time during which it exists."
      },
      {
        title: "4. Synchronous vs Asynchronous Messages",
        content: "Synchronous (solid line, solid arrowhead): The sender waits for a response.\nAsynchronous (solid line, open arrowhead): The sender continues without waiting.",
        mermaidExample: `sequenceDiagram
    participant A
    participant B
    A->>B: Synchronous Message
    A-)B: Asynchronous Message`
      },
      {
        title: "5. Return Messages",
        content: "Dashed line with open arrowhead indicating a return from a synchronous call.",
        mermaidExample: `sequenceDiagram
    participant A
    participant B
    A->>B: doWork()
    B-->>A: result`
      }
    ]
  },
  {
    id: "use-case-diagram",
    title: "Use Case Diagram Learning Path",
    diagramType: "Use Case",
    sections: [
      {
        title: "1. What is a Use Case diagram?",
        content: "Describes what a system does from the standpoint of an external observer (actor). It emphasizes *what* a system does rather than *how*.\n\n**When to use it:** To capture the functional requirements of a system.\n**When not to use it:** To model detailed logic or system architecture."
      },
      {
        title: "2. Actors and Use Cases",
        content: "Actors are users or external systems interacting with your system. Use cases are specific functions they perform.",
        mermaidExample: `flowchart LR
    User([User])
    Login((Login))
    User --> Login`
      }
    ]
  }
];
