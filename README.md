## Node Parallel Processing

**Description:**

This application leverages Node.js cluster to enable efficient parallel processing of data. It implements a flexible strategy mechanism that allows you to choose how workers distribute and process data chunks. 

**Installation:**

1. **Prerequisites:**
   - Node.js version 20 or higher

2. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   ```

3. **Navigate to the Directory:**
   ```bash
   cd repository_dir
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   ```

**Usage:**

1. Start the application with optional arguments:
   ```bash
   npm start [strategy-name] [workers_amount] [chunk_size]
   ```
   - **strategy-name:** (optional) Name of the strategy (defaults to "first-available")
     - Available options: "first-available" or "robin-round"
   - **workers_amount:** (optional) Number of worker processes (defaults to 2)
   - **chunk_size:** (optional) Chunk size for dividing data (defaults to 50)

**Additional Considerations:**

- Currently, two built-in strategies are available:
  - Robin Round: This strategy distributes data in a round-robin fashion, ensuring a balanced workload across workers.
  - First Available: This strategy assigns data chunks to the first available worker, potentially leading to uneven distribution in some scenarios.
- Collection of data for processing can be configured within the `index.ts` file. This provides flexibility in defining the data source and structure for your specific use case.

**Improvements:**

- **Separate Datastore and Iterator:** While the current implementation manages datastores within each strategy, an improvement could be to separate the datastore functionality and inject it as a separate iterator into the strategies. This separation would enhance code modularity and potentially improve maintainability.
