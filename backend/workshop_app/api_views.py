import json
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from workshop_app.models import Profile, Workshop, WorkshopType, Comment


def json_body(request):
    try:
        return json.loads(request.body)
    except:
        return {}


def user_to_dict(user):
    try:
        profile = user.profile
        return {
            "id": user.id, "username": user.username, "email": user.email,
            "first_name": user.first_name, "last_name": user.last_name,
            "name": user.get_full_name() or user.username,
            "profile": {
                "title": getattr(profile, "title", ""),
                "position": profile.position, "institute": profile.institute,
                "department": profile.department, "phone_number": profile.phone_number,
                "location": profile.location, "state": getattr(profile, "state", ""),
                "is_email_verified": profile.is_email_verified,
            }
        }
    except:
        return {"id": user.id, "username": user.username, "email": user.email,
                "first_name": user.first_name, "last_name": user.last_name,
                "name": user.get_full_name(), "profile": None}


@ensure_csrf_cookie
@require_http_methods(["GET"])
def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    return JsonResponse(user_to_dict(request.user))


@require_http_methods(["POST"])
def login_view(request):
    data = json_body(request)
    user = authenticate(request, username=data.get("username", ""), password=data.get("password", ""))
    if user is None:
        return JsonResponse({"error": "Invalid username or password"}, status=400)
    login(request, user)
    return JsonResponse({"user": user_to_dict(user)})


@require_http_methods(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logged out"})


@require_http_methods(["POST"])
def register_view(request):
    data = json_body(request)
    errors = {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "")
    confirm = data.get("confirm_password", "")

    if not username: errors["username"] = "Required"
    if not email: errors["email"] = "Required"
    if not password: errors["password"] = "Required"
    if password != confirm: errors["confirm_password"] = "Passwords don't match"
    if User.objects.filter(username=username).exists(): errors["username"] = "Username taken"
    if User.objects.filter(email=email).exists(): errors["email"] = "Email already registered"
    if errors:
        return JsonResponse({"errors": errors}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password,
                                     first_name=data.get("first_name", ""), last_name=data.get("last_name", ""))
    position = data.get("position", "coordinator")
    group, _ = Group.objects.get_or_create(name=position)
    user.groups.add(group)

    Profile.objects.create(
        user=user, position=position,
        institute=data.get("institute", ""), department=data.get("department", ""),
        phone_number=data.get("phone_number", ""), location=data.get("location", ""),
        title=data.get("title", ""), state=data.get("state", ""),
        is_email_verified=True,
        how_did_you_hear_about_us=data.get("how_did_you_hear_about_us", ""),
    )
    return JsonResponse({"message": "Registration successful"}, status=201)


@require_http_methods(["GET"])
def activate_view(request, key=""):
    return JsonResponse({"message": "Account activated successfully"})


# ========== WORKSHOPS ==========

STATUS_MAP = {0: "Pending", 1: "Accepted", 2: "Deleted"}


@login_required
@require_http_methods(["GET"])
def workshops_list(request):
    user = request.user
    position = getattr(getattr(user, 'profile', None), 'position', 'coordinator')

    if position == "instructor":
        qs = Workshop.objects.filter(instructor=user).select_related("coordinator", "workshop_type")
    else:
        qs = Workshop.objects.filter(coordinator=user).select_related("instructor", "workshop_type")

    workshops = []
    for w in qs.order_by("-date"):
        workshops.append({
            "id": w.id,
            "workshop_type_name": str(w.workshop_type),
            "date": str(w.date),
            "coordinator_name": w.coordinator.get_full_name(),
            "coordinator_id": w.coordinator.id,
            "instructor_name": w.instructor.get_full_name() if w.instructor else "",
            "instructor_id": w.instructor.id if w.instructor else None,
            "status": STATUS_MAP.get(w.status, "Pending"),
        })
    return JsonResponse({"workshops": workshops})


@login_required
@require_http_methods(["GET"])
def workshop_detail(request, pk):
    try:
        w = Workshop.objects.select_related("coordinator", "instructor", "workshop_type").get(pk=pk)
        return JsonResponse({
            "id": w.id,
            "workshop_type_name": str(w.workshop_type),
            "workshop_type_id": w.workshop_type.id,
            "date": str(w.date),
            "coordinator_name": w.coordinator.get_full_name(),
            "instructor_name": w.instructor.get_full_name() if w.instructor else "",
            "status": STATUS_MAP.get(w.status, "Pending"),
        })
    except Workshop.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)


@login_required
@require_http_methods(["POST"])
def workshop_accept(request, pk):
    try:
        w = Workshop.objects.get(pk=pk, status=0)
        w.instructor = request.user
        w.status = 1
        w.save()
        return JsonResponse({"message": "Accepted"})
    except Workshop.DoesNotExist:
        return JsonResponse({"error": "Workshop not found or already accepted"}, status=404)


@login_required
@require_http_methods(["POST"])
def workshop_change_date(request, pk):
    data = json_body(request)
    try:
        w = Workshop.objects.get(pk=pk)
        w.date = data.get("date", str(w.date))
        w.save()
        return JsonResponse({"message": "Date changed"})
    except Workshop.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)


@login_required
@require_http_methods(["POST"])
def workshop_propose(request):
    data = json_body(request)
    wt_id = data.get("workshop_type", "")
    date = data.get("date", "")
    if not wt_id or not date:
        return JsonResponse({"errors": {"general": "Workshop type and date required"}}, status=400)
    try:
        wt = WorkshopType.objects.get(pk=wt_id)
    except WorkshopType.DoesNotExist:
        return JsonResponse({"errors": {"general": "Invalid workshop type"}}, status=400)
    w = Workshop.objects.create(
        coordinator=request.user, date=date, workshop_type=wt, status=0, tnc_accepted=True,
    )
    return JsonResponse({"message": "Workshop proposed", "id": w.id}, status=201)


@login_required
@require_http_methods(["GET", "POST"])
def workshop_comments(request, pk):
    if request.method == "GET":
        comments = Comment.objects.filter(workshop_id=pk).select_related("author").order_by("-created_date")
        is_instructor = hasattr(request.user, "profile") and request.user.profile.position == "instructor"
        result = []
        for c in comments:
            if not c.public and not is_instructor:
                continue
            result.append({
                "id": c.id, "comment": c.comment, "public": c.public,
                "author_name": c.author.get_full_name() or c.author.username,
                "author_id": c.author.id,
                "created_date": str(c.created_date),
            })
        return JsonResponse({"comments": result})

    data = json_body(request)
    try:
        c = Comment.objects.create(
            workshop_id=pk, author=request.user,
            comment=data.get("comment", ""), public=data.get("public", True),
        )
        return JsonResponse({
            "id": c.id, "comment": c.comment, "public": c.public,
            "author_name": c.author.get_full_name(), "author_id": c.author.id,
            "created_date": str(c.created_date),
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


# ========== WORKSHOP TYPES ==========

@require_http_methods(["GET", "POST"])
def workshop_types_list(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Login required"}, status=401)
        data = json_body(request)
        try:
            wt = WorkshopType.objects.create(
                name=data.get("name", ""),
                duration=int(data.get("duration", 1)),
                description=data.get("description", ""),
                terms_and_conditions=data.get("terms", ""),
                instructor=request.user,
            )
            return JsonResponse({"id": wt.id, "name": wt.name}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    page_num = request.GET.get("page", 1)
    types = WorkshopType.objects.all().order_by("id")
    paginator = Paginator(types, 12)
    page = paginator.get_page(page_num)
    result = [{"id": t.id, "name": t.name, "duration": t.duration} for t in page]
    return JsonResponse({"types": result, "total_pages": paginator.num_pages, "page": page.number})


@require_http_methods(["GET", "PUT"])
def workshop_type_detail(request, pk):
    try:
        wt = WorkshopType.objects.get(pk=pk)
    except WorkshopType.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)

    if request.method == "PUT":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Login required"}, status=401)
        data = json_body(request)
        wt.name = data.get("name", wt.name)
        wt.duration = int(data.get("duration", wt.duration))
        wt.description = data.get("description", getattr(wt, "description", ""))
        wt.terms_and_conditions = data.get("terms", getattr(wt, "terms_and_conditions", ""))
        wt.save()
        return JsonResponse({"message": "Updated"})

    return JsonResponse({
        "id": wt.id, "name": wt.name, "duration": wt.duration,
        "description": getattr(wt, "description", ""),
        "terms": getattr(wt, "terms_and_conditions", ""),
    })


@require_http_methods(["GET"])
def workshop_type_tnc(request, pk):
    try:
        wt = WorkshopType.objects.get(pk=pk)
        return JsonResponse({"content": getattr(wt, "terms_and_conditions", "") or "No terms available."})
    except WorkshopType.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)


# ========== PROFILE ==========

@login_required
@require_http_methods(["GET", "PUT"])
def profile_view(request):
    user = request.user
    if request.method == "PUT":
        data = json_body(request)
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.save()
        try:
            p = user.profile
            p.title = data.get("title", p.title)
            p.phone_number = data.get("phone_number", p.phone_number)
            p.institute = data.get("institute", p.institute)
            p.department = data.get("department", p.department)
            p.location = data.get("location", p.location)
            p.state = data.get("state", getattr(p, "state", ""))
            p.save()
        except:
            pass
        return JsonResponse(user_to_dict(user))
    return JsonResponse(user_to_dict(user))


@login_required
@require_http_methods(["GET"])
def profile_detail(request, user_id):
    try:
        u = User.objects.get(pk=user_id)
        profile = u.profile
        workshops = []
        for w in Workshop.objects.filter(coordinator=u).select_related("instructor", "workshop_type").order_by("-date"):
            workshops.append({
                "instructor_name": w.instructor.get_full_name() if w.instructor else "",
                "date": str(w.date),
                "workshop_type_name": str(w.workshop_type),
            })
        return JsonResponse({
            "profile": {
                "name": u.get_full_name() or u.username, "email": u.email,
                "position": profile.position, "institute": profile.institute,
                "department": profile.department, "phone_number": profile.phone_number,
                "location": profile.location,
            },
            "workshops": workshops,
        })
    except:
        return JsonResponse({"error": "Not found"}, status=404)


# ========== STATISTICS ==========

@require_http_methods(["GET"])
def public_stats(request):
    from django.db.models import Count

    qs = Workshop.objects.filter(status=1).select_related(
        "coordinator", "coordinator__profile", "instructor", "workshop_type"
    )

    from_date = request.GET.get("from_date", "")
    to_date = request.GET.get("to_date", "")
    state = request.GET.get("state", "")
    wtype = request.GET.get("workshop_type", "")
    sort = request.GET.get("sort", "-date")
    show_mine = request.GET.get("show_mine", "") == "true"

    if from_date:
        try: qs = qs.filter(date__gte=from_date)
        except: pass
    if to_date:
        try: qs = qs.filter(date__lte=to_date)
        except: pass
    if state:
        qs = qs.filter(coordinator__profile__state=state)
    if wtype:
        qs = qs.filter(workshop_type_id=wtype)
    if show_mine and request.user.is_authenticated:
        from django.db.models import Q
        qs = qs.filter(Q(instructor=request.user) | Q(coordinator=request.user))

    qs = qs.order_by("date" if sort == "date" else "-date")

    paginator = Paginator(qs, 20)
    page = paginator.get_page(request.GET.get("page", 1))

    workshops = []
    for w in page:
        workshops.append({
            "coordinator_name": w.coordinator.get_full_name(),
            "institute": w.coordinator.profile.institute if hasattr(w.coordinator, "profile") else "",
            "instructor_name": w.instructor.get_full_name() if w.instructor else "",
            "workshop_type_name": str(w.workshop_type),
            "date": str(w.date),
        })

    state_data = Workshop.objects.filter(status=1).values("coordinator__profile__state").annotate(count=Count("id")).order_by("-count")[:15]
    state_chart = [{"name": s["coordinator__profile__state"] or "Unknown", "count": s["count"]} for s in state_data]

    type_data = Workshop.objects.filter(status=1).values("workshop_type__name").annotate(count=Count("id")).order_by("-count")[:15]
    type_chart = [{"name": t["workshop_type__name"], "count": t["count"]} for t in type_data]

    return JsonResponse({
        "workshops": workshops, "total_pages": paginator.num_pages, "page": page.number,
        "state_chart": state_chart, "type_chart": type_chart,
    })


@login_required
@require_http_methods(["GET"])
def team_stats(request):
    from django.db.models import Count
    data = Workshop.objects.filter(status=1).values(
        "instructor__first_name", "instructor__last_name"
    ).annotate(count=Count("id")).order_by("-count")
    members = [{"name": f'{d["instructor__first_name"]} {d["instructor__last_name"]}', "count": d["count"]} for d in data if d["instructor__first_name"]]
    return JsonResponse({"members": members})


@login_required
@require_http_methods(["POST"])
def change_password(request):
    data = json_body(request)
    user = request.user
    if not user.check_password(data.get("old_password", "")):
        return JsonResponse({"errors": {"general": "Current password incorrect"}}, status=400)
    new_pw = data.get("new_password", "")
    if new_pw != data.get("confirm_password", ""):
        return JsonResponse({"errors": {"general": "Passwords don't match"}}, status=400)
    if len(new_pw) < 4:
        return JsonResponse({"errors": {"general": "Password too short"}}, status=400)
    user.set_password(new_pw)
    user.save()
    login(request, user)
    return JsonResponse({"message": "Password changed"})