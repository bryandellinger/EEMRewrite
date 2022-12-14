import { Providers, ProviderState } from '@microsoft/mgt';
import { GraphEvent } from '../models/graphEvent';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { history } from '../..';
import { store } from '../stores/store';
import { Activity } from '../models/activity';
import { Category } from '../models/category';
import { Organization } from '../models/organization';
import { Location } from '../models/location';
import { GraphRoom } from '../models/graphRoom';
import { GraphScheduleResponse } from '../models/graphScheduleResponse';
import { GraphScheduleRequest } from '../models/graphScheduleRequest';
import { NonDepartmentRoomReservationRequest } from '../models/nonDepartmentRoomReservationRequest';

axios.defaults.baseURL = 'https://localhost:7285/api';

axios.interceptors.response.use(async response => {
   return response;
}, (error: AxiosError) => {
    const{data, status} = error.response!;
    switch (status){
        case 400: 
        debugger;
       if(data.errors){
        const modalStateErrors = [];
        for (const key in data.errors){
            if (data.errors[key]){
                modalStateErrors.push(data.errors[key])

            }
        }
        throw modalStateErrors.flat();
       } else {
        toast.error(data);
       }
        break;
        case 401:
        toast.error('unauthorised');
        break;
        case 404:
        history.push('/not-found')
        break;
        case 500:
        store.commonStore.setServerError(data);
        history.push('/server-error');
        break;
    }
    return Promise.reject(error);
});

const acedemicCalendarId ={
    p2fb: '88d59881-7b15-4adc-a756-5d10681cf99d',
    hossRob: '53c49041-d533-48e0-8c08-874a95b064ee'
} 

const graphResponseBody = (response: any) => {
    const retVal = response.value || response;
    console.log('graph response');
    console.log(retVal);
    return retVal;
} 

const axiosResponseBody = <T> (response: AxiosResponse<T>) =>{
    const retval = response.data;
    console.log('axios response');
    console.log(retval);
    return retval;
}

const academicCalendarURL = `/groups/${acedemicCalendarId.hossRob}/calendar/events`;
const getGraphClient = () => Providers.globalProvider.graph.client;
const IsSignedIn = () => Providers.globalProvider.state === ProviderState.SignedIn;

const graphRequests = {
    get: (url: string) => getGraphClient().api(url).orderby('start/dateTime').top(1000).get().then(graphResponseBody),
    getSingle: (url: string) => getGraphClient().api(url).get().then(graphResponseBody),
    update: (url: string, body:{}) => getGraphClient().api(url).update(body),
    create: (url: string, body:{}) => getGraphClient().api(url).create(body).then(graphResponseBody),
    delete: (url: string) => getGraphClient().api(url).delete(),
}

const axiosRequest = {
    get: <T> (url: string) => axios.get<T>(url).then(axiosResponseBody),
    post: <T> (url: string, body: {}) => axios.post<T>(url, body).then(axiosResponseBody),
    put: <T> (url: string, body: {}) => axios.put<T>(url, body).then(axiosResponseBody),
    del: <T> (url: string) => axios.delete<T>(url).then(axiosResponseBody),
}

const GraphEvents = {
    list: () => graphRequests.get(academicCalendarURL),
    update: (graphEvent: GraphEvent) => graphRequests.update(`${academicCalendarURL}/${graphEvent.id}`, graphEvent),
    create: (graphEvent: GraphEvent) => graphRequests.create(academicCalendarURL, graphEvent),
    delete: (id: string) =>graphRequests.delete(`${academicCalendarURL}/${id}`),
    details: (id: string) => graphRequests.get(`${academicCalendarURL}/${id}`)
    }

 const GraphUser = {
    details: () => graphRequests.getSingle('https://graph.microsoft.com/v1.0/me')
 }

const Activities = {
    list: () => axiosRequest.get<Activity[]>('/activities'),
    details: (id: string) => axiosRequest.get<Activity>(`/activities/${id}`),
    create: (activity: Activity) => axiosRequest.post<void>('/activities', activity),
    update: (activity: Activity, id: string) => axiosRequest.put<void>(`/activities/${id}`, activity),
    delete: (id: string) =>  axiosRequest.del<void>(`/activities/${id}`),
    reserveNonDepartmentRoom: (
        room: NonDepartmentRoomReservationRequest) => axiosRequest.post<string>(
            '/activities/reserveNonDepartmentRoom', room )
}

const Categories = {
    list: () => axiosRequest.get<Category[]>('/categories'),
}

const Organizations = {
    list: () => axiosRequest.get<Organization[]>('/organizations'),
}

const Locations = {
    list: () => axiosRequest.get<Location[]>('/locations'),
}

const GraphRooms = {
    list: () => axiosRequest.get<GraphRoom[]>('/graphrooms'),
}

const GraphSchedules = {
    list: (graphScheduleRequest : GraphScheduleRequest) => axiosRequest.post<GraphScheduleResponse[]>('/graphschedule', graphScheduleRequest)
}

const agent = {
    Activities,
    Categories,
    Organizations,
    Locations,
    GraphEvents,
    GraphRooms,
    GraphSchedules,
    GraphUser,
    IsSignedIn
}

export default agent;

