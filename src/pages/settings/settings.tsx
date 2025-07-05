import AetherServerStats from "../../components/aetherserverstatus";

export default function SettingPage (){
    const token = localStorage.getItem('aether_access_token')
    return(
        <div>
            <AetherServerStats token={token} />
        </div>
    )
}