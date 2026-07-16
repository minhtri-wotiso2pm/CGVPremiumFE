import { useMutation } from "@tanstack/react-query";
import { checkInApi } from "@/services/api/checkin.service";

export const useCheckIn = () => {

    return useMutation({

        mutationFn: checkInApi,

    });

};