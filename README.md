# Game Sales Insights Dashboard

A premium, interactive data visualization dashboard built with **React**, **Vite**, and **Supabase**. This application provides deep insights into global video game sales data, featuring real-time analytics and a modern, responsive user interface.

##  Features

- **Real-time Data Integration**: Fetches over 16,000+ records dynamically from a Supabase backend.
- **Interactive Visualizations**: 
  - **Global Sales Trend**: Line chart tracking performance over the years.
  - **Regional Market Share**: Pie chart distribution (NA, EU, JP, Other).
  - **Publisher Analytics**: Bar chart of the Top 5 performing publishers.
  - **Top Game Rankings**: Both graphical and tabular views of top-selling titles.
- **Advanced Filtering**: Narrow down results by **Genre** and **Platform** with instant data recalculation.
- **Dynamic KPIs**: Real-time calculation of Total Games, Total Global Sales, Average Sales per Title, and Peak Sales.
- **Premium UI/UX**:
  - **Glassmorphism Design**: Sleek, modern aesthetics with blurred backgrounds.
  - **Responsive Layout**: Optimally designed for various screen sizes.
  - **Multi-Theme Support**: Toggle between Default (Experimental), Light, and Dark modes.
  - **Loading States**: Visual feedback during large data fetches.

##  Tech Stack

- **Frontend**: React 19, Vite
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom Variable System)

##  Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📊 Data Source
The application uses the **Game_Sales_Data** table, which includes historical sales data across multiple regions and platforms.

---
*Developed as part of the Applications Development Midterm Project.*