from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATES = [
    {
        "id": "student_finder",
        "title": "Student & Budget Tech Finder",
        "icon": "GraduationCap",
        "color": "indigo",
        "badge": "Budget & Student Perks",
        "description": "Find top products matching your exact budget and requirements, compare side-by-side, and extract active discounts & direct store links.",
        "example_goal": "Find laptops under 80000 for students with 16GB RAM and long battery life",
        "default_safety": "balanced",
        "recommended_steps": 5
    },
    {
        "id": "shopping_compare",
        "title": "Product Comparison & Deals",
        "icon": "ShoppingCart",
        "color": "emerald",
        "badge": "Multi-Product Matrix",
        "description": "Compare 2 to 5 products side-by-side with full technical specifications, lowest price tracking, and verified store checkout links.",
        "example_goal": "Compare MacBook Air M3 vs ASUS Zenbook 14 OLED vs Lenovo ThinkPad for programming",
        "default_safety": "balanced",
        "recommended_steps": 5
    },
    {
        "id": "tech_research",
        "title": "Technical & Architecture Research",
        "icon": "Microscope",
        "color": "cyan",
        "badge": "Deep Benchmarks",
        "description": "Evaluate developer tools, frameworks, vector databases, and software architectures with verified citations.",
        "example_goal": "Research and compare open-source Vector Databases: Qdrant vs Milvus vs Chroma for RAG applications",
        "default_safety": "autonomous",
        "recommended_steps": 5
    },
    {
        "id": "career_market",
        "title": "Job Market & Salary Benchmarks",
        "icon": "Briefcase",
        "color": "blue",
        "badge": "Career Intel",
        "description": "Analyze career opportunities, skill requirements, compensation benchmarks, and tech company hiring trends.",
        "example_goal": "Find Senior AI/ML Engineer remote roles with PyTorch, LangChain and high compensation benchmarks",
        "default_safety": "balanced",
        "recommended_steps": 5
    },
    {
        "id": "github_recon",
        "title": "GitHub & Open-Source Recon",
        "icon": "Github",
        "color": "purple",
        "badge": "Repos & Velocity",
        "description": "Analyze GitHub repositories, star velocity, commit activity, software licenses, and community adoption.",
        "example_goal": "Compare top open-source browser automation agents on GitHub by architecture and capabilities",
        "default_safety": "autonomous",
        "recommended_steps": 5
    },
    {
        "id": "travel_planner",
        "title": "Smart Travel & Trip Planner",
        "icon": "Compass",
        "color": "amber",
        "badge": "Curated Itineraries",
        "description": "Plan multi-day travel itineraries with flight schedules, hotel recommendations, budget breakdowns, and local activities.",
        "example_goal": "Plan a 7-day budget travel itinerary for Japan with bullet train passes, boutique stays, and daily routes",
        "default_safety": "balanced",
        "recommended_steps": 5
    },
    {
        "id": "competitive_intel",
        "title": "Market & Competitor Intelligence",
        "icon": "TrendingUp",
        "color": "rose",
        "badge": "SaaS & Pricing Analysis",
        "description": "Investigate SaaS competitors, feature breakdowns, pricing tiers, and go-to-market strategies.",
        "example_goal": "Analyze competitive landscape and pricing models for AI Customer Support agents",
        "default_safety": "balanced",
        "recommended_steps": 5
    }
]


@router.get("", response_model=List[Dict[str, Any]])
async def get_templates():
    return TEMPLATES
