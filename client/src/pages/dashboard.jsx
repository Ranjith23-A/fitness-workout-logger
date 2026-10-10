
const fetchWorkouts = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

        if (!apiUrl) {
            throw new Error("VITE_API_URL is not configured.");
        }

        const response = await axios.get(
            `${apiUrl}/api/workouts`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = response.data;
        setWorkouts(Array.isArray(data) ? data : data.workouts || []);
    } catch (error) {
        console.error(
            "Dashboard error:",
            error.response?.data || error.message
        );
    } finally {
        setLoading(false);
    }
};
