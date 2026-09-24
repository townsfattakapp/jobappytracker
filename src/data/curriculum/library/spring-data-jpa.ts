import { defineTrack } from '../define'

export const springDataJpa = defineTrack({
  id: 'track-spring-data-jpa',
  title: 'Spring Data JPA and Hibernate',
  description: 'Persistence done properly with Hibernate 6 and Spring Data JPA: entity mapping, relationships and fetch strategies, repositories and JPQL, specifications and paging, transactions and isolation, the persistence context, the N+1 problem and entity graphs, auditing, Flyway and Liquibase, performance tuning and Testcontainers tests.',
  family: 'Backend Frameworks',
  kind: 'framework',
  icon: '🗄️',
  tags: ['spring data', 'jpa', 'hibernate', 'java', 'orm', 'postgresql', 'flyway', 'testcontainers'],
  languages: ['Java'],
  explainMode: 'concept',
  code: { label: 'Java with Spring Boot', id: 'java', fixed: true },
  supports: { coding: true, labs: true, project: true },
  prerequisites: ['track-spring-boot', 'track-sql'],
  style: 'code',
  categories: [
    {
      title: 'JPA, Hibernate and Setup',
      description: 'What the specification promises, what Hibernate adds, and how Boot wires them.',
      topics: [
        {
          title: 'JPA versus Hibernate versus Spring Data',
          description: 'JPA is the Jakarta specification, Hibernate the implementation that adds its own features, and Spring Data JPA the repository layer on top; knowing which layer owns a behaviour tells you where to look when it misbehaves.',
          concepts: ['Jakarta Persistence specification', 'Hibernate as provider', 'Spring Data repository layer', 'Where each feature lives'],
          quiz: [
            ['Is JpaRepository part of JPA?', 'No, it is Spring Data; JPA defines EntityManager.'],
            ['Which layer owns @BatchSize?', 'Hibernate; it is not in the JPA specification.'],
          ],
        },
        {
          title: 'EntityManager and EntityManagerFactory',
          description: 'The core JPA API: persist, find, merge, remove, flush and createQuery on a per-transaction EntityManager, injected as a shared proxy that resolves to the current persistence context.',
          concepts: ['EntityManager operations', 'Shared EntityManager proxy', 'EntityManagerFactory lifetime', 'Session as Hibernate\'s EntityManager'],
          quiz: [
            ['Why can a singleton service hold an EntityManager field?', 'It is a proxy that delegates to the transaction-bound instance.'],
            ['What does persist return?', 'Nothing; the passed instance becomes managed.'],
          ],
          prereqs: ['JPA versus Hibernate versus Spring Data'],
        },
        {
          title: 'Configuring JPA in Spring Boot',
          description: 'spring.jpa.* properties, hibernate.ddl-auto per environment, dialect detection, SQL logging with parameters, naming strategies and the open-in-view setting you should turn off.',
          concepts: ['spring.jpa properties', 'ddl-auto values and their danger', 'Physical naming strategy', 'Logging SQL with bind parameters', 'spring.jpa.open-in-view'],
          quiz: [
            ['What does ddl-auto=validate do?', 'Fails startup if entities and the schema disagree.'],
            ['How do you see bound parameter values in logs?', 'logging.level.org.hibernate.orm.jdbc.bind=TRACE in Hibernate 6.'],
          ],
          prereqs: ['EntityManager and EntityManagerFactory'],
        },
        {
          title: 'Connection pooling with HikariCP',
          description: 'Pool size, connection timeout and max lifetime, why more connections do not mean more throughput, and leak detection for connections held across slow calls.',
          concepts: ['Pool sizing formula', 'Connection and validation timeouts', 'Max lifetime versus server timeouts', 'Leak detection threshold'],
          quiz: [
            ['What is a reasonable pool size for a 4-core database?', 'Roughly 10; the Hikari formula is cores * 2 plus spindles.'],
            ['What does leakDetectionThreshold report?', 'Connections held longer than the threshold, with a stack trace.'],
          ],
        },
      ],
    },
    {
      title: 'Entity Mapping',
      description: 'Describing tables as classes without lying about the schema.',
      topics: [
        {
          title: 'Entities, tables and columns',
          description: '@Entity and @Table, @Column attributes such as nullable, length and unique, @Enumerated STRING versus ORDINAL, and why a no-args constructor and non-final class are required.',
          concepts: ['@Entity and @Table', '@Column constraints', '@Enumerated STRING versus ORDINAL', 'Entity class requirements'],
          quiz: [
            ['Why is EnumType.ORDINAL fragile?', 'Reordering enum constants silently changes stored meaning.'],
            ['Why must an entity have a no-args constructor?', 'Hibernate instantiates it reflectively and then sets fields.'],
          ],
        },
        {
          title: 'Primary keys and generation strategies',
          description: 'IDENTITY versus SEQUENCE versus TABLE, why IDENTITY disables insert batching, pooled sequence optimisers, UUID keys and their index cost, and assigned ids.',
          concepts: ['GenerationType choices', 'Why IDENTITY blocks batching', 'Sequence allocation and pooling', 'UUID and time-ordered ids', 'Composite keys with @EmbeddedId'],
          quiz: [
            ['Why is SEQUENCE preferred on PostgreSQL?', 'Ids are fetched ahead in blocks so inserts can be batched.'],
            ['What does allocationSize=50 mean?', 'Hibernate reserves 50 ids per sequence call.'],
          ],
          prereqs: ['Entities, tables and columns'],
        },
        {
          title: 'Value types with @Embeddable',
          description: 'Grouping columns like street and city into an Address value object, @Embedded with @AttributeOverride, and collections of embeddables with @ElementCollection.',
          concepts: ['@Embeddable value objects', '@AttributeOverride', '@ElementCollection tables', 'Embeddables versus entities'],
          quiz: [
            ['Does an @Embeddable have its own identity?', 'No, it is stored in the owner\'s table and has no id.'],
            ['What does @ElementCollection create?', 'A separate table keyed by the owner\'s id.'],
          ],
          prereqs: ['Entities, tables and columns'],
        },
        {
          title: 'Inheritance mapping',
          description: 'SINGLE_TABLE with a discriminator, JOINED with one table per class, TABLE_PER_CLASS, and @MappedSuperclass for shared fields without polymorphic queries.',
          concepts: ['SINGLE_TABLE and discriminators', 'JOINED strategy', 'TABLE_PER_CLASS costs', '@MappedSuperclass'],
          quiz: [
            ['Which strategy allows NOT NULL on subclass columns?', 'JOINED; SINGLE_TABLE must allow nulls for other subtypes.'],
            ['Can you query a @MappedSuperclass?', 'No, it is not an entity.'],
          ],
          prereqs: ['Entities, tables and columns'],
        },
        {
          title: 'Types, converters and JSON columns',
          description: 'AttributeConverter for custom types, java.time mapping, PostgreSQL jsonb through Hibernate 6 @JdbcTypeCode, arrays, and money and precision decisions.',
          concepts: ['AttributeConverter', 'java.time column mapping', '@JdbcTypeCode(SqlTypes.JSON)', 'BigDecimal precision and scale'],
          quiz: [
            ['How do you map a jsonb column in Hibernate 6?', '@JdbcTypeCode(SqlTypes.JSON) on a POJO or Map field.'],
            ['Why store money as BigDecimal not double?', 'Binary floating point cannot represent cents exactly.'],
          ],
          prereqs: ['Entities, tables and columns'],
        },
        {
          title: 'equals, hashCode and toString on entities',
          description: 'Why identity-based equality breaks in Sets before an id exists, the natural-key or generated-id-with-null-check patterns, and why toString must not touch lazy associations.',
          concepts: ['Identity versus business equality', 'Null id before persist', 'Business key equality', 'toString and lazy fields'],
          quiz: [
            ['Why can hashCode change after persist?', 'If it depends on a generated id, the id goes from null to a value.'],
            ['What happens when toString prints a lazy collection outside a session?', 'LazyInitializationException.'],
          ],
          prereqs: ['Primary keys and generation strategies'],
        },
      ],
    },
    {
      title: 'Relationships and Fetching',
      description: 'The associations, their owning sides and what gets loaded when.',
      topics: [
        {
          title: '@ManyToOne and the owning side',
          description: 'The foreign-key side of every relationship, @JoinColumn, default EAGER fetch and why to override it to LAZY, and how a lazy proxy loads on first access.',
          concepts: ['@ManyToOne and @JoinColumn', 'Owning side rule', 'Default EAGER versus LAZY', 'Lazy proxies'],
          quiz: [
            ['Which side holds the foreign key?', 'The @ManyToOne side, which is always the owning side.'],
            ['What is the default fetch type of @ManyToOne?', 'EAGER, which you should usually change to LAZY.'],
          ],
        },
        {
          title: '@OneToMany with mappedBy',
          description: 'Bidirectional collections, keeping both sides in sync with helper methods, cascade types and orphanRemoval, and why a unidirectional @OneToMany creates a join table or extra updates.',
          concepts: ['mappedBy and inverse side', 'Sync helper methods', 'Cascade types', 'orphanRemoval', 'Unidirectional one-to-many pitfalls'],
          quiz: [
            ['What does orphanRemoval=true do?', 'Deletes a child removed from the collection.'],
            ['Why add child.setParent(this) in addChild?', 'Only the owning side is persisted; the collection alone changes nothing.'],
          ],
          prereqs: ['@ManyToOne and the owning side'],
        },
        {
          title: '@OneToOne and shared keys',
          description: 'Mapping one-to-one with a foreign key or a shared primary key via @MapsId, why the inverse side cannot be lazy without bytecode enhancement, and unique constraints.',
          concepts: ['@OneToOne with @JoinColumn', '@MapsId shared primary key', 'Inverse one-to-one laziness', 'Unique constraint on the key'],
          quiz: [
            ['Why is the non-owning @OneToOne side loaded eagerly?', 'Hibernate must query to know whether to return null or a proxy.'],
            ['What does @MapsId do?', 'Uses the associated entity\'s id as this entity\'s primary key.'],
          ],
          prereqs: ['@ManyToOne and the owning side'],
        },
        {
          title: '@ManyToMany and join tables',
          description: '@JoinTable with join and inverse columns, Set versus List, why cascading REMOVE is wrong here, and replacing the join table with an entity when it needs attributes.',
          concepts: ['@JoinTable mapping', 'Set versus List collections', 'No REMOVE cascade', 'Promoting the join table to an entity'],
          quiz: [
            ['What happens with CascadeType.REMOVE on @ManyToMany?', 'Deleting one side deletes the other entities, not just the link rows.'],
            ['Why prefer Set for many-to-many?', 'Hibernate can add and remove rows individually instead of re-inserting a bag.'],
          ],
          prereqs: ['@ManyToOne and the owning side'],
        },
        {
          title: 'Lazy loading and LazyInitializationException',
          description: 'Proxies and PersistentCollections load on access only while the session is open; why the exception appears in controllers and Jackson, and the fixes that do not involve open-in-view.',
          concepts: ['When lazy loading works', 'Why the exception appears', 'Fixes: fetch in the query or map to DTOs', 'Hibernate.initialize'],
          quiz: [
            ['Why does Jackson trigger LazyInitializationException?', 'Serialising the entity touches lazy fields after the session closed.'],
            ['Is enabling open-in-view a fix?', 'It hides the error by holding the session through rendering, at the cost of connection time and hidden queries.'],
          ],
          prereqs: ['@OneToMany with mappedBy'],
        },
        {
          title: 'The N+1 problem',
          description: 'One query for the parents then one per parent for the children; recognising it in SQL logs, measuring query counts in tests, and the four fixes: JOIN FETCH, entity graphs, batch fetching and DTO projections.',
          concepts: ['Recognising N+1 in logs', 'Counting queries in tests', 'JOIN FETCH', 'Choosing among the fixes'],
          quiz: [
            ['How many queries does loading 100 orders with lazy customers issue?', '101 if each customer is accessed.'],
            ['What does JOIN FETCH change?', 'The association is loaded in the same SQL query.'],
          ],
          prereqs: ['Lazy loading and LazyInitializationException'],
        },
        {
          title: 'Entity graphs and batch fetching',
          description: '@EntityGraph on repository methods to declare what to load per use case, @NamedEntityGraph, hibernate.default_batch_fetch_size to load lazy associations in IN batches, and MultipleBagFetchException.',
          concepts: ['@EntityGraph on repository methods', 'Named entity graphs', 'default_batch_fetch_size', 'MultipleBagFetchException and fixes'],
          quiz: [
            ['What causes MultipleBagFetchException?', 'Fetch-joining two List collections in one query.'],
            ['What does default_batch_fetch_size=50 do?', 'Loads up to 50 lazy associations with one IN query.'],
          ],
          prereqs: ['The N+1 problem'],
        },
      ],
    },
    {
      title: 'Repositories and Queries',
      description: 'From derived method names to hand-written SQL.',
      topics: [
        {
          title: 'Repository interfaces',
          description: 'CrudRepository, ListCrudRepository and JpaRepository, what the SimpleJpaRepository proxy implements, save as persist-or-merge, and findById returning Optional.',
          concepts: ['Repository hierarchy', 'SimpleJpaRepository behaviour', 'save: persist or merge', 'Optional return types'],
          quiz: [
            ['How does save decide between persist and merge?', 'By isNew: a null id or @Version means persist, else merge.'],
            ['What does JpaRepository add over CrudRepository?', 'Batch operations, flush, and JPA-specific methods like getReferenceById.'],
          ],
        },
        {
          title: 'Derived query methods',
          description: 'findByStatusAndCreatedAtAfter parsed into JPQL, supported keywords like Containing, In, OrderBy, IgnoreCase, exists and count prefixes, and when a method name gets too long to keep.',
          concepts: ['Method name parsing', 'Keywords and operators', 'exists, count and delete prefixes', 'Limiting with First and Top'],
          quiz: [
            ['What does findTop3ByOrderByScoreDesc return?', 'The three highest-scoring rows.'],
            ['When should you switch to @Query?', 'When the name stops reading naturally or needs joins.'],
          ],
          prereqs: ['Repository interfaces'],
        },
        {
          title: 'JPQL with @Query',
          description: 'Entity-oriented queries with named and positional parameters, joins across associations, constructor expressions for DTOs, and validation of JPQL at startup.',
          concepts: ['JPQL syntax and entities', 'Named parameters', 'Joins in JPQL', 'Constructor expressions for DTOs'],
          quiz: [
            ['When is a bad JPQL string detected?', 'At context startup, when the repository proxy is created.'],
            ['How do you return a record from JPQL?', 'SELECT new com.app.OrderSummary(o.id, o.total) FROM Order o'],
          ],
          prereqs: ['Derived query methods'],
        },
        {
          title: 'Native queries and @Modifying',
          description: 'nativeQuery=true for database-specific SQL, mapping results to interfaces or Tuple, bulk updates and deletes with @Modifying, and why clearAutomatically matters afterwards.',
          concepts: ['nativeQuery=true', 'Mapping native results', '@Modifying updates and deletes', 'clearAutomatically and flushAutomatically'],
          quiz: [
            ['Why does the persistence context go stale after a bulk update?', 'The update bypasses managed entities, which still hold old values.'],
            ['Does a bulk delete trigger cascades?', 'No, JPQL and native deletes skip entity lifecycle and cascades.'],
          ],
          prereqs: ['JPQL with @Query'],
        },
        {
          title: 'Projections',
          description: 'Interface projections with getters, class and record projections, dynamic projections via a Class parameter, and why projections avoid loading whole entities for read views.',
          concepts: ['Interface-based projections', 'Record and class projections', 'Dynamic projections', 'Open projections with SpEL'],
          quiz: [
            ['Do interface projections fetch only the listed columns?', 'Yes for closed projections; open projections load the entity.'],
            ['How do you let the caller choose the projection?', 'Add a Class<T> type parameter to the repository method.'],
          ],
          prereqs: ['JPQL with @Query'],
        },
        {
          title: 'Custom repository implementations',
          description: 'Fragment interfaces with an Impl class for Criteria or JDBC code, mixing them into a repository, and a base repository shared by all repositories.',
          concepts: ['Fragment interface and Impl', 'Composing fragments', 'Custom base repository', 'Injecting EntityManager in fragments'],
          quiz: [
            ['How does Spring Data find the implementation of a fragment?', 'By the Impl suffix on a class in the same package.'],
            ['Can a repository combine several fragments?', 'Yes, it can extend any number of fragment interfaces.'],
          ],
          prereqs: ['Repository interfaces'],
        },
      ],
    },
    {
      title: 'Specifications, Paging and Sorting',
      description: 'Dynamic filters and result sets that scale.',
      topics: [
        {
          title: 'Specifications and the Criteria API',
          description: 'JpaSpecificationExecutor with composable Specification predicates built from CriteriaBuilder, combining with and, or and not, and avoiding string concatenation for dynamic filters.',
          concepts: ['Specification interface', 'CriteriaBuilder predicates', 'Composing with and, or, not', 'Joins inside specifications'],
          quiz: [
            ['What does a Specification return?', 'A Predicate built from Root, CriteriaQuery and CriteriaBuilder.'],
            ['Why not build JPQL strings for dynamic filters?', 'Injection risk and unreadable branching; specifications compose safely.'],
          ],
        },
        {
          title: 'Query by Example and Querydsl',
          description: 'Example matchers for simple probe-based search, and Querydsl generated Q-classes for type-safe queries; where each stops being enough.',
          concepts: ['Example and ExampleMatcher', 'Querydsl Q-classes', 'QuerydslPredicateExecutor', 'Limits of each approach'],
          quiz: [
            ['Can Query by Example handle ranges?', 'No, only equality and string matching.'],
            ['What generates Q-classes?', 'The Querydsl annotation processor at compile time.'],
          ],
          prereqs: ['Specifications and the Criteria API'],
        },
        {
          title: 'Offset paging with Pageable',
          description: 'PageRequest, Page versus Slice, the extra count query and its cost, passing Pageable from a controller, and returning a stable DTO instead of Page.',
          concepts: ['PageRequest and Sort', 'Page versus Slice', 'The count query cost', 'Pageable in controllers'],
          quiz: [
            ['What does Slice avoid?', 'The count query; it only knows whether a next page exists.'],
            ['Why does deep offset paging get slow?', 'The database scans and discards all earlier rows.'],
          ],
        },
        {
          title: 'Keyset pagination with the Scroll API',
          description: 'Spring Data 3.1 ScrollPosition.keyset and Window for cursor-based paging that stays fast at any depth, requirements on a unique sort, and building an API cursor from it.',
          concepts: ['ScrollPosition keyset', 'Window and WindowIterator', 'Unique sort requirement', 'Encoding cursors for clients'],
          quiz: [
            ['Why must the sort include a unique column?', 'Ties would make the keyset position ambiguous and skip or repeat rows.'],
            ['What is the main limitation of keyset paging?', 'No jumping to an arbitrary page number.'],
          ],
          prereqs: ['Offset paging with Pageable'],
        },
        {
          title: 'Paging with fetch joins',
          description: 'Why Hibernate warns HHH90003004 and pages in memory when you fetch-join a collection with a Pageable, and the two-query pattern that pages ids first.',
          concepts: ['In-memory paging warning', 'Two-query id then fetch', 'Paging on the parent only', 'Batch fetch as the alternative'],
          quiz: [
            ['Why does paging with a collection fetch join misbehave?', 'The join multiplies rows, so limits must be applied after loading all of them.'],
            ['What is the safe pattern?', 'Page the parent ids, then fetch the parents with their collections by id.'],
          ],
          prereqs: ['Offset paging with Pageable', 'Entity graphs and batch fetching'],
        },
      ],
    },
    {
      title: 'Persistence Context and Transactions',
      description: 'The state machine underneath every save and the boundaries that keep it consistent.',
      topics: [
        {
          title: 'Entity states and the first-level cache',
          description: 'Transient, managed, detached and removed; how the persistence context caches by id within a transaction, and why two finds return the same instance.',
          concepts: ['Transient, managed, detached, removed', 'Identity map per context', 'Repeatable reads within a session', 'detach and clear'],
          quiz: [
            ['Do two findById calls in one transaction hit the database twice?', 'No, the second returns the cached managed instance.'],
            ['What is a detached entity?', 'One that was managed but whose context has closed.'],
          ],
        },
        {
          title: 'Dirty checking and flushing',
          description: 'Managed entities are compared with their snapshot at flush; when flush happens (commit, before queries, explicit), FlushMode, and why setters without save still write.',
          concepts: ['Snapshot comparison at flush', 'Flush triggers', 'FlushMode AUTO versus COMMIT', 'Write-behind ordering'],
          quiz: [
            ['Why did an update happen without calling save?', 'The entity was managed and dirty checking flushed the change.'],
            ['Does a JPQL query trigger a flush?', 'Yes under AUTO, if pending changes affect the queried entities.'],
          ],
          prereqs: ['Entity states and the first-level cache'],
        },
        {
          title: 'persist, merge and getReferenceById',
          description: 'persist attaches the instance, merge copies state into a managed copy and returns it, and getReferenceById gives a proxy for setting foreign keys without a select.',
          concepts: ['persist semantics', 'merge returns a copy', 'getReferenceById proxies', 'Detached updates through merge'],
          quiz: [
            ['Why is the object passed to merge still detached afterwards?', 'merge copies its state into a managed instance and returns that one.'],
            ['When does getReferenceById hit the database?', 'Only when a non-id field is accessed.'],
          ],
          prereqs: ['Entity states and the first-level cache'],
        },
        {
          title: '@Transactional propagation and rollback',
          description: 'REQUIRED, REQUIRES_NEW, MANDATORY, NESTED and SUPPORTS; rollback on unchecked exceptions only, rollbackFor, and the rollback-only marking that surfaces as UnexpectedRollbackException.',
          concepts: ['Propagation behaviours', 'rollbackFor and noRollbackFor', 'Rollback-only marking', 'UnexpectedRollbackException'],
          quiz: [
            ['What causes UnexpectedRollbackException?', 'An inner REQUIRED method marked rollback-only while the outer tried to commit.'],
            ['Which exceptions roll back by default?', 'RuntimeException and Error, not checked exceptions.'],
          ],
          prereqs: ['Dirty checking and flushing'],
        },
        {
          title: 'Isolation levels and anomalies',
          description: 'READ COMMITTED versus REPEATABLE READ versus SERIALIZABLE in PostgreSQL terms, the anomalies each prevents, setting isolation on @Transactional, and the cost of stricter levels.',
          concepts: ['Dirty, non-repeatable and phantom reads', 'PostgreSQL isolation behaviour', 'Isolation attribute on @Transactional', 'Serialization failures and retries'],
          quiz: [
            ['What is the default isolation in PostgreSQL?', 'READ COMMITTED.'],
            ['What must an application do under SERIALIZABLE?', 'Retry transactions that fail with a serialization error.'],
          ],
          prereqs: ['@Transactional propagation and rollback'],
        },
        {
          title: 'Optimistic and pessimistic locking',
          description: '@Version for optimistic concurrency with ObjectOptimisticLockingFailureException, @Lock with PESSIMISTIC_WRITE for select for update, lock timeouts and choosing between them.',
          concepts: ['@Version optimistic locking', 'Handling optimistic failures', '@Lock PESSIMISTIC_WRITE', 'Lock timeouts and deadlocks'],
          quiz: [
            ['When does an optimistic lock fail?', 'At flush, when the version in the row no longer matches.'],
            ['What SQL does PESSIMISTIC_WRITE produce on PostgreSQL?', 'SELECT ... FOR UPDATE.'],
          ],
          prereqs: ['@Transactional propagation and rollback'],
        },
        {
          title: 'readOnly transactions and the transaction proxy',
          description: 'readOnly=true skips dirty checking and can route to replicas, the self-invocation and private-method traps of the proxy, and @Transactional on repository versus service.',
          concepts: ['readOnly optimisations', 'Proxy limits on private and self calls', 'Service-level boundaries', 'TransactionTemplate for programmatic control'],
          quiz: [
            ['Does readOnly=true prevent writes?', 'It disables flush; writes are silently discarded, not rejected, with Hibernate.'],
            ['Why put @Transactional on the service rather than the repository?', 'One transaction should span the whole use case, not each query.'],
          ],
          prereqs: ['@Transactional propagation and rollback'],
        },
      ],
    },
    {
      title: 'Auditing, Events and Migrations',
      description: 'Tracking who changed what and evolving the schema safely.',
      topics: [
        {
          title: 'Auditing with @CreatedDate and @LastModifiedBy',
          description: '@EnableJpaAuditing, AuditingEntityListener on a base class, AuditorAware pulling the user from the SecurityContext, and a fixed clock for tests.',
          concepts: ['@EnableJpaAuditing', 'Auditable base class', 'AuditorAware from SecurityContext', 'DateTimeProvider for tests'],
          quiz: [
            ['What populates @CreatedBy?', 'The AuditorAware bean at persist time.'],
            ['Why put audit fields on a @MappedSuperclass?', 'Every entity inherits them without repeating the mapping.'],
          ],
        },
        {
          title: 'Entity lifecycle callbacks',
          description: '@PrePersist, @PreUpdate, @PostLoad and friends for defaults and derived fields, their limits (no queries, no other entities), and entity listeners versus domain events.',
          concepts: ['@PrePersist and @PreUpdate', '@PostLoad', 'Callback restrictions', 'EntityListeners'],
          quiz: [
            ['Can a @PrePersist method call a repository?', 'No, callbacks must not use the EntityManager.'],
            ['When does @PostLoad run?', 'After the entity is loaded from the database or refreshed.'],
          ],
          prereqs: ['Auditing with @CreatedDate and @LastModifiedBy'],
        },
        {
          title: 'Domain events from aggregates',
          description: '@DomainEvents and @AfterDomainEventPublication on an aggregate root so save publishes events, and @TransactionalEventListener to react after commit.',
          concepts: ['@DomainEvents on aggregates', 'AbstractAggregateRoot', 'Publishing on save', 'After-commit listeners'],
          quiz: [
            ['When are @DomainEvents published?', 'When the aggregate is passed to repository save.'],
            ['Why listen AFTER_COMMIT?', 'A rolled-back transaction should not trigger side effects.'],
          ],
          prereqs: ['Entity lifecycle callbacks'],
        },
        {
          title: 'History tables with Hibernate Envers',
          description: '@Audited entities get _AUD tables and a revision table, querying past versions with AuditReader, and the storage and write cost of auditing every change.',
          concepts: ['@Audited and _AUD tables', 'Revision entity', 'AuditReader queries', 'Cost of full history'],
          quiz: [
            ['What does Envers store per change?', 'A row in the _AUD table with the revision number and type.'],
            ['Can you audit only some fields?', 'Yes, @NotAudited excludes fields.'],
          ],
          prereqs: ['Auditing with @CreatedDate and @LastModifiedBy'],
        },
        {
          title: 'Flyway migrations',
          description: 'Versioned SQL scripts applied in order at startup, the schema history table and checksums, baselines for existing databases, and repeatable scripts for views.',
          concepts: ['Versioned scripts and ordering', 'Checksums and immutability', 'Baseline on migrate', 'Repeatable migrations for views'],
          quiz: [
            ['What happens if you edit an applied migration?', 'Validation fails on the checksum mismatch.'],
            ['How do you adopt Flyway on an existing database?', 'baseline-on-migrate with a baseline version.'],
          ],
        },
        {
          title: 'Liquibase changelogs',
          description: 'YAML or XML changesets with rollback blocks, preconditions, contexts per environment, and generating a diff against entities; when to prefer it over Flyway.',
          concepts: ['Changesets and changelogs', 'Rollback definitions', 'Contexts and preconditions', 'Liquibase versus Flyway'],
          quiz: [
            ['What does a changeset need to be unique?', 'id, author and file path.'],
            ['Which tool has built-in rollback support?', 'Liquibase; Flyway undo needs the paid tier.'],
          ],
          prereqs: ['Flyway migrations'],
        },
        {
          title: 'Zero-downtime schema changes',
          description: 'Expand-and-contract for renames, adding nullable columns before backfilling, dropping columns after code stops reading them, and long-running migrations outside startup.',
          concepts: ['Expand and contract', 'Backfills in batches', 'Compatible deploy ordering', 'Locks from ALTER TABLE'],
          quiz: [
            ['Why not rename a column in one deploy?', 'Old and new code run together during rollout; one of them breaks.'],
            ['Why add NOT NULL only after a backfill?', 'Adding it earlier fails or locks the table while existing rows are null.'],
          ],
          prereqs: ['Flyway migrations'],
        },
      ],
    },
    {
      title: 'Performance Tuning',
      description: 'Measuring, then fixing, what the ORM does to the database.',
      topics: [
        {
          title: 'Seeing the SQL: logging and datasource-proxy',
          description: 'Hibernate statement logging, datasource-proxy or p6spy for bound values and timing, and asserting query counts in tests so regressions fail the build.',
          concepts: ['Hibernate statement logging', 'datasource-proxy and p6spy', 'Query count assertions', 'Slow query thresholds'],
          quiz: [
            ['Why is show-sql=true not enough?', 'It prints to stdout without parameters or timing.'],
            ['How do you fail a test when queries exceed a limit?', 'Count statements through a proxy datasource and assert the number.'],
          ],
        },
        {
          title: 'JDBC batching for inserts and updates',
          description: 'hibernate.jdbc.batch_size with order_inserts and order_updates, why IDENTITY ids disable it, flushing and clearing in loops, and the rewriteBatchedStatements trick on MySQL.',
          concepts: ['batch_size and ordering', 'Flush and clear in loops', 'IDENTITY blocks batching', 'Verifying batches happened'],
          quiz: [
            ['Why clear the context every N inserts?', 'To free memory and keep dirty checking cheap.'],
            ['How do you confirm batching works?', 'Statement logging shows one batched execution with N rows.'],
          ],
          prereqs: ['Seeing the SQL: logging and datasource-proxy'],
        },
        {
          title: 'Second-level and query caches',
          description: 'Entity caching across sessions with JCache and Ehcache or Caffeine, cache concurrency strategies, the query cache and its invalidation, and why they are rarely the first fix.',
          concepts: ['Enabling the second-level cache', 'Cache concurrency strategies', 'Query cache and timestamps', 'When caching backfires'],
          quiz: [
            ['What invalidates a query cache region?', 'Any write to a table involved in the query.'],
            ['Which strategy suits reference data?', 'READ_ONLY.'],
          ],
          prereqs: ['Seeing the SQL: logging and datasource-proxy'],
        },
        {
          title: 'Read models and DTO queries',
          description: 'Bypassing entity loading for lists and reports with constructor projections, JdbcClient queries or database views, and keeping entities for write paths.',
          concepts: ['Constructor projections for lists', 'JdbcClient for reports', 'Database views mapped read-only', 'Write model versus read model'],
          quiz: [
            ['Why is a DTO query faster than loading entities?', 'No proxies, no dirty-check snapshots and only the needed columns.'],
            ['Can an entity map to a view?', 'Yes, mark it @Immutable and never save it.'],
          ],
        },
        {
          title: 'Indexes, plans and ORM-generated SQL',
          description: 'Reading EXPLAIN for a JPQL query, adding indexes through migrations rather than @Index, functions in WHERE that defeat indexes, and LIKE with a leading wildcard.',
          concepts: ['EXPLAIN on generated SQL', 'Indexes via migrations', 'Sargable predicates', 'Composite index column order'],
          quiz: [
            ['Why not rely on @Index to create indexes?', 'ddl-auto should not manage production schema; migrations should.'],
            ['Does LOWER(email) = ? use a plain index on email?', 'No, unless there is an expression index on LOWER(email).'],
          ],
          prereqs: ['Seeing the SQL: logging and datasource-proxy'],
        },
        {
          title: 'Streaming and large result sets',
          description: 'Stream<T> repository returns with fetch size for millions of rows, StatelessSession for bulk work, and closing streams and transactions properly.',
          concepts: ['Stream returns and fetch size', 'StatelessSession', 'Try-with-resources on streams', 'Memory of managed entities'],
          quiz: [
            ['Why must a Stream result run inside a transaction?', 'The connection and cursor stay open only while the transaction does.'],
            ['What does StatelessSession skip?', 'The first-level cache, dirty checking and cascades.'],
          ],
          prereqs: ['JDBC batching for inserts and updates'],
        },
      ],
    },
    {
      title: 'Testing Persistence',
      description: 'Tests that run against the real database engine.',
      topics: [
        {
          title: '@DataJpaTest slices',
          description: 'A context with only JPA components, transactional rollback per test, TestEntityManager for setup and flush-and-clear to force real SQL, and the H2 replacement to switch off.',
          concepts: ['Slice contents', 'flush and clear to hit the database', 'Rollback per test method', 'AutoConfigureTestDatabase replace NONE'],
          quiz: [
            ['Why call flush() and clear() before asserting?', 'Otherwise the first-level cache hides whether the mapping actually works.'],
            ['Is a @DataJpaTest transactional by default?', 'Yes, each test rolls back.'],
          ],
        },
        {
          title: 'PostgreSQL in Testcontainers',
          description: 'Running the same engine as production with @ServiceConnection, a shared container per JVM, Flyway migrating the test schema, and tests for dialect-specific SQL.',
          concepts: ['@ServiceConnection PostgreSQL', 'Singleton container per JVM', 'Flyway in tests', 'Dialect-specific assertions'],
          quiz: [
            ['Why not test on H2?', 'Different SQL dialect and behaviour hide production bugs.'],
            ['How do you avoid starting a container per test class?', 'A static container started once and reused.'],
          ],
          prereqs: ['@DataJpaTest slices'],
        },
        {
          title: 'Testing transactions and concurrency',
          description: 'Disabling the test transaction with @Transactional(propagation = NOT_SUPPORTED) to see real commits, two threads racing on a versioned row, and verifying rollback on failure.',
          concepts: ['NOT_SUPPORTED on tests', 'Racing threads for optimistic locks', 'Asserting rollback', 'TransactionTemplate in tests'],
          quiz: [
            ['Why can a rollback-per-test hide bugs?', 'Constraint violations and after-commit listeners only appear on real commits.'],
            ['How do you provoke an optimistic lock failure in a test?', 'Load the same row in two transactions and update both.'],
          ],
          prereqs: ['PostgreSQL in Testcontainers'],
        },
        {
          title: 'Test data and cleanup strategies',
          description: '@Sql scripts, builders, truncating between tests versus transactions, and keeping fixture data small enough that the suite stays fast.',
          concepts: ['@Sql and script ordering', 'Entity builders', 'Truncate versus rollback', 'Fixture size discipline'],
          quiz: [
            ['When must you truncate instead of rolling back?', 'When tests commit, for example with NOT_SUPPORTED or async listeners.'],
            ['What does @Sql(executionPhase = AFTER_TEST_METHOD) do?', 'Runs a cleanup script after the test.'],
          ],
          prereqs: ['@DataJpaTest slices'],
        },
      ],
    },
    {
      title: 'Projects',
      description: 'Data-heavy features that expose every mapping and performance decision.',
      style: 'project',
      topics: [
        {
          title: 'Project: library catalogue with search',
          description: 'Books, authors and copies with many-to-many and one-to-many mappings, Flyway migrations, specification-based search with keyset paging, DTO projections for lists and a query-count test suite.',
          concepts: ['Map the domain', 'Migrations and indexes', 'Specification search', 'Keyset pagination endpoint', 'Query-count tests'],
          quiz: [
            ['How do you page search results without deep-offset cost?', 'Keyset paging on (title, id).'],
            ['Why project list results to DTOs?', 'To avoid loading authors and copies for every row.'],
          ],
        },
        {
          title: 'Project: inventory with concurrent stock updates',
          description: 'Stock reservations with @Version, pessimistic locking for the checkout path, a race test with parallel threads on Testcontainers PostgreSQL, and audited stock movements.',
          concepts: ['Reservation model', 'Optimistic versus pessimistic paths', 'Parallel race tests', 'Audited movements', 'Retry on conflict'],
          quiz: [
            ['When should checkout use a pessimistic lock?', 'When conflicts are frequent and retries would waste more than waiting.'],
            ['What proves the race is handled?', 'A test where N threads reserve and the final stock is exactly right.'],
          ],
        },
        {
          title: 'Project: event history with Envers and domain events',
          description: 'An orders aggregate that publishes domain events on save, after-commit listeners updating a read model, Envers history endpoint and a bulk import with JDBC batching.',
          concepts: ['Aggregate with domain events', 'After-commit read model', 'Envers history API', 'Batched bulk import', 'Performance measurement'],
          quiz: [
            ['Why update the read model after commit?', 'A rollback must not leave a phantom entry.'],
            ['What batch size and id strategy suit the import?', 'SEQUENCE ids with batch_size around 50 and periodic flush and clear.'],
          ],
        },
      ],
    },
  ],
})
