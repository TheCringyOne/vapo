import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const LoginForm = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const queryClient = useQueryClient();

	const { mutate: loginMutation, isLoading } = useMutation({
		mutationFn: (userData) => axiosInstance.post("/auth/login", userData),
		onSuccess: (response) => {
			// Store the isFirstLogin status from the response if it exists
			if (response.data && response.data.isFirstLogin !== undefined) {
				// Pass isFirstLogin to authUser invalidation
				queryClient.invalidateQueries({ 
					queryKey: ["authUser"],
					// When refetching, add the isFirstLogin flag to the result
					updater: (oldData) => {
						if (oldData) {
							return {
								...oldData,
								isFirstLogin: response.data.isFirstLogin
							};
						}
						return oldData;
					}
				});
			} else {
				// Standard invalidation without updater if no isFirstLogin
				queryClient.invalidateQueries({ queryKey: ["authUser"] });
			}
		},
		onError: (err) => {
			toast.error(err.response.data.message || "Something went wrong");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		loginMutation({ username, password });
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4 w-full max-w-md'>
			<input
				type='text'
				placeholder='Usuario'
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				className='input input-bordered w-full'
				required
			/>
			<input
				type='password'
				placeholder='Contraseña'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className='input input-bordered w-full'
				required
			/>

			<button type='submit' className='btn btn-primary w-full'>
				{isLoading ? <Loader className='size-5 animate-spin' /> : "Entrar"}
			</button>
		</form>
	);
};
export default LoginForm;