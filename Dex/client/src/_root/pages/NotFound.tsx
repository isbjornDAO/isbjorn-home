import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const NotFound = () => {

    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center w-full h-full">
            <div className="mt-20 mb-4 w-4/5 xl:w-3/4 h-full">
                <h1 className="h1-bold ">404 Page Not Found</h1>
                <div className="flex items-center justify-center w-full h-full pb-[300px]">
                    <Button className="go-to-swap-button" onClick={() => navigate("/swap")}>Go to Swap</Button>
                </div>
            </div>
        </div>
    )
}

export default NotFound