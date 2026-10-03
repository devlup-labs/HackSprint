// Seed bank for the daily challenge. Each entry:
// [field, difficulty, prompt, [options x4], correctIndex, explanation]
// Multiple choice only, so answers can be graded automatically. Extend and
// restart: boot seeding upserts by a hash of the prompt and never overwrites.
const RAW_QUESTIONS = [
  // ── Web Development ──
  ["Web Development", "easy", "Which HTML element is best for the main navigation links of a page?", ["<div>", "<nav>", "<section>", "<aside>"], 1, "<nav> is the semantic landmark for major navigation blocks, which helps screen readers and SEO."],
  ["Web Development", "easy", "In CSS, which property creates space INSIDE an element's border?", ["margin", "gap", "padding", "outline"], 2, "Padding is inner space; margin is outside the border."],
  ["Web Development", "medium", "What does `useEffect(() => {...}, [])` do in React?", ["Runs on every render", "Runs once after the first render", "Runs before the first render", "Never runs"], 1, "An empty dependency array means the effect runs once after mount."],
  ["Web Development", "medium", "Which HTTP status code means the resource was created?", ["200", "201", "204", "302"], 1, "201 Created is returned after a successful POST that creates a resource."],
  ["Web Development", "medium", "What is the main purpose of the `key` prop in a React list?", ["Styling items", "Helping React identify which items changed", "Encrypting data", "Sorting the list"], 1, "Stable keys let React's reconciliation match old and new elements correctly."],
  ["Web Development", "hard", "What does the CSS rule `position: sticky` do?", ["Fixes the element to the viewport always", "Behaves relative until a scroll threshold, then sticks", "Removes the element from flow", "Centers the element"], 1, "Sticky toggles between relative and fixed based on the scroll position and the `top`/`bottom` offset."],
  ["Web Development", "easy", "Which method converts a JSON string to a JavaScript object?", ["JSON.stringify", "JSON.parse", "JSON.object", "JSON.decode"], 1, "JSON.parse parses text; JSON.stringify does the reverse."],
  ["Web Development", "medium", "Which of these is NOT a JavaScript primitive type?", ["string", "symbol", "object", "bigint"], 2, "Objects are reference types; string, symbol and bigint are primitives."],
  ["Web Development", "medium", "What does CORS control?", ["Database access", "Which origins a browser lets call an API", "File compression", "Cookie encryption"], 1, "Cross-Origin Resource Sharing is a browser policy enforced via response headers."],
  ["Web Development", "hard", "What is the output of `console.log(typeof null)` in JavaScript?", ["null", "undefined", "object", "number"], 2, "A historical quirk: typeof null returns 'object'."],
  ["Web Development", "easy", "Which attribute makes an <img> accessible to screen readers?", ["title", "alt", "src", "name"], 1, "The alt attribute provides a text alternative."],
  ["Web Development", "medium", "What is the difference between `let` and `var`?", ["No difference", "let is block-scoped, var is function-scoped", "var is block-scoped", "let can't be reassigned"], 1, "let/const are block-scoped; var is function-scoped and hoisted."],

  // ── Backend ──
  ["Backend", "easy", "Which HTTP method is idempotent and used to fully replace a resource?", ["POST", "PUT", "PATCH", "CONNECT"], 1, "PUT replaces a resource and repeating it gives the same result."],
  ["Backend", "medium", "What is the purpose of a JWT's signature?", ["Compress the token", "Verify the token wasn't tampered with", "Hide the payload", "Set the expiry"], 1, "The signature proves integrity; the payload itself is only base64-encoded, not secret."],
  ["Backend", "medium", "What does the Node.js event loop allow?", ["True multi-threaded JS", "Non-blocking I/O on a single thread", "Faster CPU math", "Automatic caching"], 1, "I/O is delegated and callbacks run when ready, keeping the main thread free."],
  ["Backend", "medium", "Which status code is correct for a valid request from an unauthenticated user?", ["400", "401", "403", "404"], 1, "401 means not authenticated; 403 means authenticated but not allowed."],
  ["Backend", "hard", "What problem does rate limiting mainly protect against?", ["Slow queries", "Abuse and overload from too many requests", "XSS", "Memory leaks"], 1, "It throttles clients so one caller can't exhaust the service."],
  ["Backend", "easy", "What does REST stand for?", ["Remote Execution State Transfer", "Representational State Transfer", "Reliable Server Transfer", "Request Handling Standard"], 1, "REST is an architectural style built on resources and standard HTTP verbs."],
  ["Backend", "medium", "Why hash passwords with bcrypt instead of encrypting them?", ["Hashing is reversible", "Hashes are one-way and salted, so leaks are harder to exploit", "Encryption is slower to write", "Bcrypt shrinks storage"], 1, "You never need the original password back, so a slow one-way hash is safer."],
  ["Backend", "hard", "What is the main benefit of a message queue between services?", ["Lower disk use", "Decoupling and absorbing traffic spikes", "Removing the need for a database", "Encrypting traffic"], 1, "Producers and consumers work independently and at different speeds."],
  ["Backend", "medium", "Which is the best way to avoid SQL/NoSQL injection?", ["Trim input", "Use parameterised queries / validated schemas", "Use GET only", "Lowercase input"], 1, "Never concatenate user input into queries; bind parameters instead."],
  ["Backend", "easy", "What does an API gateway typically do?", ["Stores user data", "Routes and secures requests to backend services", "Renders HTML", "Trains models"], 1, "It is the single entry point handling routing, auth and rate limits."],

  // ── DSA ──
  ["DSA", "easy", "What is the time complexity of binary search on a sorted array?", ["O(n)", "O(log n)", "O(n log n)", "O(1)"], 1, "Each step halves the search space."],
  ["DSA", "easy", "Which data structure works on LIFO?", ["Queue", "Stack", "Heap", "Graph"], 1, "A stack pops the most recently pushed item first."],
  ["DSA", "medium", "Average time to look up a key in a hash table?", ["O(n)", "O(log n)", "O(1)", "O(n²)"], 2, "With a good hash function lookups are constant time on average."],
  ["DSA", "medium", "Which traversal of a BST gives sorted order?", ["Pre-order", "In-order", "Post-order", "Level-order"], 1, "In-order visits left, node, right, producing ascending keys."],
  ["DSA", "medium", "Which algorithm finds shortest paths with non-negative weights?", ["DFS", "Dijkstra", "Kruskal", "Prim"], 1, "Dijkstra's greedy approach needs non-negative edge weights."],
  ["DSA", "hard", "Worst-case time complexity of quicksort?", ["O(n log n)", "O(n)", "O(n²)", "O(log n)"], 2, "A consistently bad pivot gives quadratic behaviour."],
  ["DSA", "medium", "Which structure is best for a 'top K largest' stream?", ["Min-heap of size K", "Stack", "Linked list", "Trie"], 0, "Keep a min-heap of size K; the root is the smallest of the top K."],
  ["DSA", "easy", "Space complexity of storing n numbers in an array?", ["O(1)", "O(log n)", "O(n)", "O(n²)"], 2, "Memory grows linearly with n."],
  ["DSA", "hard", "Which technique solves overlapping subproblems with optimal substructure?", ["Greedy", "Dynamic programming", "Brute force", "Divide only"], 1, "DP stores subproblem results to avoid recomputation."],
  ["DSA", "medium", "BFS on a graph uses which structure?", ["Stack", "Queue", "Heap", "Set only"], 1, "A queue processes nodes level by level."],
  ["DSA", "hard", "Detecting a cycle in a linked list in O(1) space uses?", ["Hash set", "Two pointers (Floyd)", "Sorting", "Recursion"], 1, "A slow and a fast pointer meet if there's a cycle."],

  // ── AI / ML ──
  ["AI / ML", "easy", "What is overfitting?", ["Model too simple", "Model memorises training data and generalises poorly", "Too little data collected", "Slow training"], 1, "Great training score, poor performance on unseen data."],
  ["AI / ML", "easy", "Which type of learning uses labelled data?", ["Supervised", "Unsupervised", "Reinforcement only", "Self-play"], 0, "Supervised learning maps inputs to known labels."],
  ["AI / ML", "medium", "What does a confusion matrix show?", ["Training speed", "Counts of true/false positives and negatives", "Feature names", "Learning rate"], 1, "It breaks predictions into TP, FP, TN and FN."],
  ["AI / ML", "medium", "Why split data into train and test sets?", ["Save memory", "Measure performance on unseen data", "Speed up training", "Remove outliers"], 1, "The test set estimates real-world generalisation."],
  ["AI / ML", "medium", "Which activation is common for binary output probability?", ["ReLU", "Sigmoid", "Tanh only", "Softmax over 10 classes"], 1, "Sigmoid squashes outputs into (0, 1)."],
  ["AI / ML", "hard", "What does the learning rate control?", ["Dataset size", "Step size of weight updates", "Number of layers", "Batch order"], 1, "Too high diverges; too low trains very slowly."],
  ["AI / ML", "medium", "Precision is defined as?", ["TP / (TP + FN)", "TP / (TP + FP)", "TN / (TN + FP)", "(TP + TN) / total"], 1, "Of everything predicted positive, how much was right."],
  ["AI / ML", "hard", "What problem does dropout address?", ["Underfitting", "Overfitting", "Vanishing data", "Slow inference"], 1, "Randomly disabling neurons discourages co-adaptation."],
  ["AI / ML", "medium", "An LLM 'token' is best described as?", ["A password", "A chunk of text the model reads and generates", "A GPU unit", "A training epoch"], 1, "Tokens are sub-word pieces; context limits are counted in them."],
  ["AI / ML", "hard", "What is RAG in LLM applications?", ["Random answer generation", "Retrieving relevant documents to ground the model's answer", "Reinforced agent games", "Rapid GPU allocation"], 1, "Retrieval-Augmented Generation injects fetched context into the prompt."],

  // ── Databases ──
  ["Databases", "easy", "Which SQL clause filters rows after grouping?", ["WHERE", "HAVING", "ORDER BY", "LIMIT"], 1, "HAVING filters groups; WHERE filters rows before grouping."],
  ["Databases", "easy", "What does a PRIMARY KEY guarantee?", ["Fast writes", "Unique, non-null row identity", "Encryption", "Foreign links"], 1, "It uniquely identifies each row."],
  ["Databases", "medium", "What does an index mainly improve?", ["Write speed", "Read/lookup speed", "Storage size", "Backup time"], 1, "Indexes speed up lookups at the cost of extra writes and space."],
  ["Databases", "medium", "ACID's 'I' stands for?", ["Integrity", "Isolation", "Indexing", "Idempotency"], 1, "Isolation: concurrent transactions don't interfere."],
  ["Databases", "medium", "Which join returns only matching rows from both tables?", ["LEFT JOIN", "INNER JOIN", "FULL OUTER JOIN", "CROSS JOIN"], 1, "INNER JOIN keeps rows with a match on both sides."],
  ["Databases", "hard", "In MongoDB, which is generally best when data is read together?", ["Always reference documents", "Embed related data in one document", "Use separate databases", "Avoid indexes"], 1, "Embedding avoids extra lookups when data is accessed as a unit."],
  ["Databases", "medium", "What is database normalisation for?", ["Faster network", "Reducing redundancy and update anomalies", "Encrypting columns", "Caching"], 1, "It splits data into related tables to avoid duplication."],
  ["Databases", "hard", "What does the CAP theorem say a distributed store can't fully have during a partition?", ["Speed and size", "Both consistency and availability", "Security and logging", "Joins and indexes"], 1, "During a partition you must trade consistency against availability."],
  ["Databases", "easy", "What is Redis mostly used as?", ["Relational database", "In-memory key-value store / cache", "Message editor", "File system"], 1, "It keeps data in memory for very fast access."],

  // ── DevOps & Cloud ──
  ["DevOps & Cloud", "easy", "What is a Docker image?", ["A running container", "A read-only template used to create containers", "A VM", "A log file"], 1, "Containers are running instances of images."],
  ["DevOps & Cloud", "medium", "What does CI in CI/CD stand for?", ["Code Inspection", "Continuous Integration", "Container Infrastructure", "Cloud Instance"], 1, "Changes are merged and automatically built and tested often."],
  ["DevOps & Cloud", "medium", "What does Kubernetes primarily do?", ["Write code", "Orchestrate containers at scale", "Store images", "Monitor only"], 1, "It schedules, scales and heals containerised workloads."],
  ["DevOps & Cloud", "medium", "Which is a benefit of infrastructure as code?", ["Manual changes", "Repeatable, version-controlled environments", "Bigger servers", "No testing"], 1, "Environments are defined in files you can review and re-create."],
  ["DevOps & Cloud", "hard", "What is blue/green deployment?", ["Two teams reviewing code", "Running two environments and switching traffic between them", "Colour-coded logs", "A load test"], 1, "You release to the idle environment then flip traffic, enabling instant rollback."],
  ["DevOps & Cloud", "easy", "What does `git clone` do?", ["Deletes a repo", "Copies a remote repository locally", "Merges branches", "Creates a tag"], 1, "It downloads the repo with its history."],
  ["DevOps & Cloud", "medium", "What is a reverse proxy like nginx commonly used for?", ["Compiling code", "Routing and TLS termination in front of servers", "Training models", "Writing logs only"], 1, "It accepts client traffic and forwards it to backend services."],
  ["DevOps & Cloud", "hard", "Which metric type should only ever go up (e.g. total requests)?", ["Gauge", "Counter", "Histogram bucket value", "Label"], 1, "Counters are monotonic; rates are derived from them."],

  // ── Security ──
  ["Security", "easy", "What does HTTPS add over HTTP?", ["Speed", "Encryption in transit", "Caching", "Compression"], 1, "TLS encrypts and authenticates the connection."],
  ["Security", "medium", "What is XSS?", ["Injecting scripts into pages viewed by others", "Stealing database files", "DDoS", "Brute forcing passwords"], 0, "Cross-site scripting runs attacker script in a victim's browser."],
  ["Security", "medium", "What is the principle of least privilege?", ["Give everyone admin", "Grant only the access needed", "Share passwords", "Disable logging"], 1, "Minimising permissions limits damage if an account is compromised."],
  ["Security", "medium", "What does 2FA improve?", ["Page speed", "Account security via a second factor", "SEO", "Uptime"], 1, "A stolen password alone is no longer enough."],
  ["Security", "hard", "Why use `HttpOnly` cookies?", ["Faster cookies", "Block JavaScript from reading them", "Make them persistent", "Share across domains"], 1, "It mitigates token theft through XSS."],
  ["Security", "easy", "What is phishing?", ["A network scan", "Tricking people into revealing credentials", "A firewall rule", "A backup method"], 1, "Fake messages or sites trick users into giving up secrets."],
  ["Security", "hard", "What does CSRF exploit?", ["Weak hashing", "A browser automatically sending a victim's cookies", "Open ports", "Stale DNS"], 1, "A forged cross-site request rides on the victim's authenticated session."],

  // ── Product Management ──
  ["Product Management", "easy", "What does MVP stand for in startups?", ["Most Valuable Player", "Minimum Viable Product", "Maximum Value Plan", "Main Version Pipeline"], 1, "The smallest version that lets you learn from real users."],
  ["Product Management", "medium", "What is customer churn?", ["New signups", "Customers who stop using the product", "Revenue growth", "Support tickets"], 1, "Churn rate measures how many customers leave over a period."],
  ["Product Management", "medium", "What does CAC measure?", ["Cost to acquire a customer", "Customer account count", "Cash and credit", "Cost of all code"], 0, "Customer Acquisition Cost: spend divided by customers gained."],
  ["Product Management", "medium", "A healthy startup wants LTV to be ___ CAC.", ["Lower than", "Much higher than", "Exactly equal to", "Unrelated to"], 1, "Lifetime value should comfortably exceed acquisition cost (often 3x)."],
  ["Product Management", "hard", "What is product-market fit?", ["A pretty UI", "A product that satisfies strong demand in a market", "Having investors", "Big team size"], 1, "Users pull the product: retention and word of mouth show it."],
  ["Product Management", "easy", "What is a KPI?", ["Key Performance Indicator", "Known Product Idea", "Key Purchase Item", "Keyboard Input"], 0, "A measurable value tracking progress toward a goal."],
  ["Product Management", "medium", "What does an A/B test compare?", ["Two servers", "Two variants to see which performs better", "Two teams", "Two budgets"], 1, "Users are split between versions and a metric is compared."],
  ["Product Management", "hard", "What is the 'runway' of a startup?", ["Office size", "How long cash lasts at the current burn rate", "Launch date", "Number of investors"], 1, "Cash in bank divided by monthly net burn."],

  // ── Design ──
  ["Design", "easy", "What does UX stand for?", ["User Experience", "Universal Exchange", "Unique Extension", "User Extra"], 0, "How a person feels using the product end to end."],
  ["Design", "medium", "What is the main purpose of whitespace in UI?", ["Wasting space", "Improving readability and focus", "Reducing file size", "Branding only"], 1, "Space groups content and guides attention."],
  ["Design", "medium", "WCAG's minimum contrast ratio for normal body text (AA)?", ["2:1", "3:1", "4.5:1", "10:1"], 2, "4.5:1 for normal text, 3:1 for large text."],
  ["Design", "medium", "What is a wireframe?", ["Final artwork", "A low-fidelity layout sketch", "A brand guide", "A database schema"], 1, "It focuses on structure before visual polish."],
  ["Design", "hard", "Fitts's law says target acquisition time depends on?", ["Colour and font", "Distance to and size of the target", "Number of pages", "Screen brightness"], 1, "Bigger, closer targets are faster to hit."],
  ["Design", "easy", "Which colour model do screens use?", ["CMYK", "RGB", "Pantone", "Greyscale only"], 1, "Screens mix red, green and blue light."],


  // ── Product Management (more) ──
  ["Product Management", "medium", "In the RICE prioritisation framework, what does the 'C' stand for?", ["Cost", "Confidence", "Complexity", "Customers"], 1, "Reach, Impact, Confidence, Effort: confidence discounts guesses you can't back with data."],
  ["Product Management", "easy", "A good user story is usually written as?", ["As a <user>, I want <goal> so that <benefit>", "A database schema", "A bug report", "A marketing slogan"], 0, "It keeps the user, the need and the reason together."],
  ["Product Management", "medium", "What is a 'North Star metric'?", ["A server uptime number", "The single metric that best captures the value users get", "Total headcount", "Ad spend"], 1, "Teams align around one number that reflects delivered value."],
  ["Product Management", "hard", "Which is the best use of a product roadmap?", ["A fixed date-by-date promise", "Communicating direction and priorities, not guaranteed dates", "Listing every bug", "Replacing user research"], 1, "Roadmaps show intent and sequencing; they should stay flexible."],
  ["Product Management", "medium", "Dogfooding means?", ["Testing on pets", "Using your own product internally", "Selling to competitors", "Free trials"], 1, "Teams that use their own product spot problems early."],

  // ── Robotics ──
  ["Robotics", "easy", "What does ROS stand for?", ["Remote Operating System", "Robot Operating System", "Real-time Object Sensor", "Rotary Output Signal"], 1, "ROS is a middleware framework for building robot software."],
  ["Robotics", "medium", "What does a PID controller combine?", ["Position, Input, Data", "Proportional, Integral, Derivative terms", "Power, Intensity, Distance", "Pulse, Interrupt, Delay"], 1, "It corrects error using present (P), accumulated (I) and predicted (D) error."],
  ["Robotics", "medium", "What does SLAM let a robot do?", ["Charge itself", "Build a map while tracking its own position in it", "Speak", "Lift heavier loads"], 1, "Simultaneous Localisation And Mapping."],
  ["Robotics", "easy", "Which sensor measures distance using reflected laser pulses?", ["Thermistor", "LiDAR", "Potentiometer", "Hall switch"], 1, "LiDAR times the return of light to measure range."],
  ["Robotics", "medium", "An IMU typically combines which sensors?", ["Camera and microphone", "Accelerometer and gyroscope", "Sonar and radar", "GPS and compass only"], 1, "It tracks linear acceleration and angular velocity."],
  ["Robotics", "hard", "What does forward kinematics compute for a robot arm?", ["Motor torque", "End-effector pose from the joint angles", "Battery life", "Joint angles from a target pose"], 1, "Inverse kinematics is the reverse: joint angles for a desired pose."],
  ["Robotics", "easy", "Why use PWM to control a DC motor's speed?", ["It changes the average power by varying duty cycle", "It reverses polarity", "It cools the motor", "It measures current"], 0, "Rapid on/off switching with a different duty cycle changes the effective voltage."],
  ["Robotics", "medium", "What is a rotary encoder used for?", ["Heating", "Measuring shaft position or speed", "Data encryption", "Voltage regulation"], 1, "It outputs pulses or codes as the shaft turns."],
  ["Robotics", "hard", "A Kalman filter is mainly used to?", ["Compress images", "Estimate a system's state from noisy measurements", "Sort sensor logs", "Schedule tasks"], 1, "It blends a motion model with noisy sensor readings."],
  ["Robotics", "medium", "Which actuator gives precise angular position using feedback?", ["Servo motor", "Brushed fan motor", "Solenoid", "Relay"], 0, "Servos close the loop with a position sensor."],

  // ── Embedded & IoT ──
  ["Embedded & IoT", "easy", "Which protocol is lightweight publish/subscribe, popular in IoT?", ["FTP", "MQTT", "SMTP", "SSH"], 1, "MQTT suits constrained devices and unreliable networks."],
  ["Embedded & IoT", "medium", "I2C uses how many signal wires (besides power/ground)?", ["1", "2", "4", "8"], 1, "SDA for data and SCL for clock."],
  ["Embedded & IoT", "medium", "What does an ADC do?", ["Stores code", "Converts analogue signals to digital values", "Amplifies power", "Encrypts firmware"], 1, "Microcontrollers read sensors through analogue-to-digital converters."],
  ["Embedded & IoT", "hard", "What is a watchdog timer for?", ["Measuring temperature", "Resetting the system if the firmware hangs", "Logging data", "Syncing time over the internet"], 1, "Firmware must keep 'kicking' it; if it stops, the chip resets."],
  ["Embedded & IoT", "medium", "Why use interrupts instead of polling?", ["They use more CPU", "The CPU can react to events immediately without constant checking", "They avoid memory", "They are required for all code"], 1, "Interrupts let the CPU sleep or work until hardware signals an event."],
  ["Embedded & IoT", "easy", "Which board family is a popular beginner microcontroller platform?", ["Arduino", "Kubernetes", "Photoshop", "Hadoop"], 0, "Arduino boards make hardware prototyping approachable."],

  // ── Data Science ──
  ["Data Science", "easy", "Which measure is least affected by outliers?", ["Mean", "Median", "Range", "Variance"], 1, "The median depends on rank, not extreme values."],
  ["Data Science", "easy", "Which chart best shows the distribution of one numeric variable?", ["Pie chart", "Histogram", "Line chart over time", "Radar chart"], 1, "A histogram bins values to show their spread."],
  ["Data Science", "medium", "A correlation of -1 means?", ["No relationship", "A perfect negative linear relationship", "A strong causal link", "A data error"], 1, "When one goes up the other goes down in exact proportion."],
  ["Data Science", "medium", "Why scale features before training k-NN?", ["To add more rows", "So no feature dominates distance purely due to units", "To reduce labels", "To speed up disks"], 1, "Distance-based models are sensitive to feature magnitude."],
  ["Data Science", "easy", "In pandas, which method shows the first rows of a DataFrame?", ["head()", "top()", "first_rows()", "peek()"], 0, "df.head() shows 5 rows by default."],
  ["Data Science", "hard", "Correlation between two variables proves?", ["Causation", "Only that they vary together; causation needs more evidence", "Nothing at all", "That one is a label"], 1, "Confounders and reverse causality can create correlation."],

  // ── Blockchain ──
  ["Blockchain", "easy", "What links one block to the next in a blockchain?", ["The previous block's hash", "A phone number", "A shared password", "File size"], 0, "Each block stores the prior block's hash, so edits break the chain."],
  ["Blockchain", "medium", "What is a smart contract?", ["A legal PDF", "Code stored on a blockchain that runs when conditions are met", "A paid subscription", "A wallet password"], 1, "It executes automatically and transparently on-chain."],
  ["Blockchain", "medium", "What is the purpose of a consensus mechanism?", ["Make blocks bigger", "Let nodes agree on the ledger without a central authority", "Hide transactions", "Mint tokens only"], 1, "Proof of Work and Proof of Stake are examples."],
  ["Blockchain", "hard", "Why are gas fees charged on Ethereum?", ["To pay for the computation and storage of transactions", "To mint new coins", "To hide wallets", "To store NFTs free"], 0, "They price computation and discourage spam."],
  ["Blockchain", "easy", "A wallet's private key is used to?", ["Share publicly", "Sign transactions proving ownership", "Mine blocks", "Browse faster"], 1, "Never share it; whoever holds it controls the funds."],

  // ── Mobile Development ──
  ["Mobile Development", "easy", "Which language does Flutter use?", ["Swift", "Dart", "Kotlin", "Ruby"], 1, "Flutter apps are written in Dart."],
  ["Mobile Development", "medium", "What is a benefit of React Native?", ["One JavaScript codebase for iOS and Android", "Only works on iOS", "No JavaScript needed", "Runs only in browsers"], 0, "It shares most code across both platforms."],
  ["Mobile Development", "medium", "Android's `onCreate()` is called when?", ["The app is uninstalled", "An activity is first created", "The battery is low", "A network call ends"], 1, "It is the first lifecycle callback of an activity."],
  ["Mobile Development", "medium", "Push notifications on Android typically go through?", ["SMTP", "Firebase Cloud Messaging", "FTP", "Bluetooth"], 1, "FCM delivers messages from your server to devices."],
  ["Mobile Development", "hard", "Why debounce a search box in a mobile app?", ["To use more battery", "To avoid firing a request on every keystroke", "To make text bold", "To avoid rendering"], 1, "It waits for a pause in typing before calling the API."],

  // ── Cloud & Architecture ──
  ["DevOps & Cloud", "medium", "What does 'serverless' mean?", ["No servers exist", "You run code without managing servers; the provider scales it", "Only static sites", "Offline apps"], 1, "Servers still exist, but provisioning and scaling are the provider's job."],
  ["DevOps & Cloud", "hard", "Horizontal scaling means?", ["A bigger single machine", "Adding more machines to share the load", "Faster disks", "More RAM only"], 1, "Vertical scaling makes one machine bigger; horizontal adds more."],
];

// The bank is written with the correct answer wherever it was convenient;
// shuffle the options deterministically per question (seeded by the prompt)
// so the right answer isn't predictably in one slot, and it stays stable
// across restarts.
const seededRandom = (seed) => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
};

export const DAILY_QUESTIONS = RAW_QUESTIONS.map(([field, difficulty, prompt, options, correctIndex, explanation]) => {
  const rand = seededRandom(prompt);
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return [field, difficulty, prompt, order.map((i) => options[i]), order.indexOf(correctIndex), explanation];
});
