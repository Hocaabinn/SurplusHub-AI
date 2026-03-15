# 🥗 SurplusHub — AI-Powered Food Rescue Marketplace

![Vercel Deployment](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

> **"Save Food, Save the Planet, Save Money."** > SurplusHub is a green-tech solution connecting culinary businesses with conscious consumers to rescue surplus food in real-time using Artificial Intelligence.

---

## 🌟 Vision & Impact

Every year, one-third of the world's food production goes to waste. **SurplusHub** digitizes the sustainability ecosystem through three core pillars:
1. **Economy:** Helping partners generate revenue from products that would otherwise be discarded.
2. **Social:** Providing consumers with high-quality food at affordable, discounted prices.
3. **Environment:** Directly reducing greenhouse gas (CO2) emissions by preventing food waste.

---

## 🚀 Key Features

### 🤖 Smart Dynamic Pricing (AI)
Our AI-driven algorithm automatically adjusts product prices based on the store's operating hours. As closing time approaches, discounts increase dynamically to ensure **Zero Waste** without manual intervention.

### 📍 Hyper-local Discovery
Integrated geolocation features connect "food rescuers" with nearby partners instantly through an interactive real-time map.

### 📊 CO2 Impact Dashboard
Every transaction tracks environmental impact. Users receive transparent data on exactly how much carbon emission they have prevented through their purchase.

### 💎 Premium AI Tools
Exclusive features for business partners, including an **AI Image Generator** that creates aesthetic product photos automatically from simple text descriptions.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + RLS)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** React Context API
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.app/)

---

## 💻 Getting Started

### 1. Clone the repository
```bash
git clone [https://github.com/Hocaabinn/SurplusHub-AI-Powered-Food-Rescue-Marketplace.git](https://github.com/Hocaabinn/SurplusHub-AI-Powered-Food-Rescue-Marketplace.git)
cd SurplusHub-AI-Powered-Food-Rescue-Marketplace

```

### 2. Install dependencies

```bash
npm install

```

### 3. Setup Environment Variables

Create a `.env.local` file and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 4. Database Configuration (SQL Editor)

Run the following script in your Supabase SQL Editor to enable Premium features and security:

```sql
-- Add premium status column
ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT false;

-- Enable Row Level Security (RLS) update policy
CREATE POLICY "Users can update own profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

```

### 5. Run the development server

```bash
npm run dev

```

---

## 🎨  Process Development

This project was developed using the **Process Development** philosophy:

* **Intuitive Development:** Prioritizing speed and solution-oriented coding over rigid documentation.
* **AI-Co-piloted:** Leveraging AI to handle complex backend logic (RLS, SQL injection, Dynamic Pricing) so the developer can focus on *Value* and *Vibe*.
* **Rapid Iteration:** Transforming technical hurdles into live features within minutes through active debugging and real-time prototyping.

---

<p align="center">
Built with 💚 by <strong>Hocaabinn & Team</strong>
</p>



-----

Why this works:

  * **Startup Vibe:** Using terms like "AI-driven algorithm," "Sustainability ecosystem," and "Green-tech" makes it sound professional.
  * **Clear Value:** It clearly states *why* the app exists (environmental impact) and *how* it works (AI features).
  * **Developer Friendly:** The "Getting Started" section is clean and actually includes the SQL fix we worked on together\!

Would you like me to also generate a **License** file (like MIT License) to make the repository look even more official?


