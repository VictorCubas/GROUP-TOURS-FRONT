import axiosInstance from "@/service/axiosInterceptor";

export const fetchData = async (page: number, page_size: number = 5) => {
    try {
      const resp = await axiosInstance.get(`/permisos/?page=${page}&page_size=${page_size}`);
      console.log('permisos list: ', resp?.data);
      if(resp?.data?.results){
        // setPermisos(resp?.data?.results ?? []);

        return resp?.data ?? null;
      }
    } catch (error) {
      console.log(error);
    }
  }


//   export async function fetchEvent({ id, signal }) {
//   const response = await fetch(`http://localhost:3000/events/${id}`, { signal });

//   if (!response.ok) {
//     const error = new Error('An error occurred while fetching the event');
//     error.code = response.status;
//     error.info = await response.json();
//     throw error;
//   }

//   const { event } = await response.json();

//   return event;
// }