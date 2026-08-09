from datetime import datetime, timedelta


def add_working_days(start_date, days):
    current_date = start_date
    days_added = 0

    while days_added < days:
        current_date += timedelta(days=1)

        # Monday = 0
        # Sunday = 6
        if current_date.weekday() < 5:
            days_added += 1

    return current_date


def get_follow_up_status(follow_up):
    if not follow_up.get("follow_up_required"):
        return "Not Required"

    if follow_up.get("status") == "Completed":
        return "Completed"

    due_at = follow_up.get("due_at")

    print("CURRENT TIME:", datetime.utcnow())
    print("DUE TIME:", due_at)

    if not due_at:
        return "Pending"

    if datetime.utcnow() > due_at:
        print("TASK IS OVERDUE")
        return "Overdue"

    print("TASK IS STILL PENDING")
    return "Pending"