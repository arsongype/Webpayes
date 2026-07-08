from langchain_core.tools import tool

@tool
def calculate_budget(income: float, fixed_expenses: float, variable_expenses: float) -> str:
    """Calcule le budget disponible après dépenses fixes et variables."""
    remaining = income - fixed_expenses - variable_expenses
    savings_rate = (remaining / income * 100) if income > 0 else 0
    return f"Budget disponible: {remaining:.2f}€\nTaux d'épargne: {savings_rate:.1f}%"

@tool
def calculate_loan(principal: float, annual_rate: float, years: int) -> str:
    """Calcule la mensualité d'un prêt immobilier ou personnel."""
    monthly_rate = annual_rate / 100 / 12
    n_months = years * 12
    if monthly_rate == 0:
        monthly = principal / n_months
    else:
        monthly = principal * (monthly_rate * (1 + monthly_rate) ** n_months) / ((1 + monthly_rate) ** n_months - 1)
    total = monthly * n_months
    return f"Mensualité: {monthly:.2f}€\nCoût total: {total:.2f}€\nIntérêts totaux: {total - principal:.2f}€"

@tool
def savings_goal(current: float, target: float, monthly_contribution: float) -> str:
    """Estime le temps nécessaire pour atteindre un objectif d'épargne."""
    if monthly_contribution <= 0:
        return "La contribution mensuelle doit être supérieure à 0."
    remaining = target - current
    months = remaining / monthly_contribution
    years = months / 12
    return f"Temps estimé: {months:.1f} mois ({years:.1f} ans)"

FINANCIAL_TOOLS = [calculate_budget, calculate_loan, savings_goal]
